package com.example.service;

import com.example.dto.ExpenseRequest;
import com.example.dto.SettlementRequest;
import com.example.dto.SplitDetail;
import com.example.entity.*;
import com.example.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.Set;

@Service
public class ExpenseService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private SplitRepository splitRepository;

    @Autowired
    private BalanceRepository balanceRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Transactional
    public Expense addExpense(ExpenseRequest request) {
        User paidBy = userRepository.findById(request.getPaidById())
                .orElseThrow(() -> new RuntimeException("Paid by user not found"));
        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        BigDecimal totalAmount = BigDecimal.valueOf(request.getAmount());
        SplitType splitType = SplitType.valueOf(request.getSplitType());
        if (group.getMembers() == null || group.getMembers().isEmpty()) {
            throw new RuntimeException("Group has no members");
        }
        Expense expense = new Expense(request.getDescription(), totalAmount, paidBy, group, splitType);

        Set<Split> splitEntities = new HashSet<>();
        if (splitType == SplitType.EQUAL) {
            int numMembers = group.getMembers().size();
            BigDecimal equalAmount = totalAmount.divide(BigDecimal.valueOf(numMembers), 2, RoundingMode.HALF_UP);
            for (User member : group.getMembers()) {
                Split split = new Split(expense, member, equalAmount.doubleValue(), 0.0);
                splitEntities.add(split);
            }
        } else if (splitType == SplitType.EXACT) {
            for (SplitDetail detail : request.getSplits()) {
                User user = userRepository.findById(detail.getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found"));
                Split split = new Split(expense, user, detail.getAmount(), 0.0);
                splitEntities.add(split);
            }
        } else if (splitType == SplitType.PERCENTAGE) {
            for (SplitDetail detail : request.getSplits()) {
                User user = userRepository.findById(detail.getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found"));
                BigDecimal amount = totalAmount.multiply(BigDecimal.valueOf(detail.getPercentage() / 100.0));
                Split split = new Split(expense, user, amount.doubleValue(), detail.getPercentage());
                splitEntities.add(split);
            }
        }

        expense.setSplits(splitEntities);
        expense = expenseRepository.save(expense);

        updateBalancesForExpense(expense);
        return expense;
    }

    private void updateBalancesForExpense(Expense expense) {
        for (Split split : expense.getSplits()) {
            User user = split.getUser();
            User paidBy = expense.getPaidBy();
            if (!user.equals(paidBy)) {
                Balance balance = getOrCreateBalance(user, paidBy, expense.getGroup());
                BigDecimal currentAmount = balance.getAmount() != null ? balance.getAmount() : BigDecimal.ZERO;
                BigDecimal newAmount = currentAmount.add(BigDecimal.valueOf(split.getAmount()));
                balance.setAmount(newAmount);
                balanceRepository.save(balance);
            }
        }
    }

    private Balance getOrCreateBalance(User from, User to, Group group) {
        Balance balance = balanceRepository.findByFromUserIdAndToUserIdAndGroupId(from.getId(), to.getId(), group.getId());
        if (balance == null) {
            balance = new Balance(from, to, BigDecimal.ZERO, group);
        }
        return balance;
    }

    @Transactional
    public Transaction settle(SettlementRequest request) {
        User from = userRepository.findById(request.getFromUserId())
                .orElseThrow(() -> new RuntimeException("From user not found"));
        User to = userRepository.findById(request.getToUserId())
                .orElseThrow(() -> new RuntimeException("To user not found"));
        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        Balance balance = balanceRepository.findByFromUserIdAndToUserIdAndGroupId(from.getId(), to.getId(), group.getId());
        if (balance == null) {
            throw new RuntimeException("No balance found between these users in this group");
        }
        BigDecimal currentAmount = balance.getAmount() != null ? balance.getAmount() : BigDecimal.ZERO;
        BigDecimal settleAmount = BigDecimal.valueOf(request.getAmount());
        if (currentAmount.compareTo(settleAmount) < 0) {
            throw new RuntimeException("Settlement amount exceeds balance");
        }

        BigDecimal newAmount = currentAmount.subtract(settleAmount);
        balance.setAmount(newAmount);
        if (newAmount.compareTo(BigDecimal.ZERO) == 0) {
            balanceRepository.delete(balance);
        } else {
            balanceRepository.save(balance);
        }

        Transaction transaction = new Transaction(from, to, settleAmount, group);
        return transactionRepository.save(transaction);
    }
}
