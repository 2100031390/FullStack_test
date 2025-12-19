package com.example.repository;

import com.example.entity.Balance;
import com.example.entity.Group;
import com.example.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BalanceRepository extends JpaRepository<Balance, Long> {
    List<Balance> findByGroupId(Long groupId);
    List<Balance> findByFromUserId(Long fromUserId);
    List<Balance> findByToUserId(Long toUserId);
    Balance findByFromUserIdAndToUserIdAndGroupId(Long fromUserId, Long toUserId, Long groupId);
}
