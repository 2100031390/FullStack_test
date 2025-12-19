package com.example.dto;

import java.util.List;

public class ExpenseRequest {
    private String description;
    private double amount;
    private Long paidById;
    private Long groupId;
    private String splitType;
    private List<SplitDetail> splits;

    // Getters and Setters
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public Long getPaidById() { return paidById; }
    public void setPaidById(Long paidById) { this.paidById = paidById; }
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    public String getSplitType() { return splitType; }
    public void setSplitType(String splitType) { this.splitType = splitType; }
    public List<SplitDetail> getSplits() { return splits; }
    public void setSplits(List<SplitDetail> splits) { this.splits = splits; }
}
