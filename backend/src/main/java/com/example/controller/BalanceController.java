package com.example.controller;

import com.example.dto.SettlementRequest;
import com.example.entity.Balance;
import com.example.entity.Transaction;
import com.example.repository.BalanceRepository;
import com.example.repository.TransactionRepository;
import com.example.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/balances")
public class BalanceController {

    @Autowired
    private BalanceRepository balanceRepository;

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private TransactionRepository transactionRepository;

    @GetMapping("/group/{groupId}")
    public List<Balance> getBalances(@PathVariable Long groupId) {
        return balanceRepository.findByGroupId(groupId);
    }

    @PostMapping("/settle")
    public Transaction settle(@RequestBody SettlementRequest request) {
        return expenseService.settle(request);
    }

    @GetMapping("/transactions/group/{groupId}")
    public List<Transaction> getTransactions(@PathVariable Long groupId) {
        return transactionRepository.findByGroupId(groupId);
    }
}
