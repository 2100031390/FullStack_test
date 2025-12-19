package com.example.controller;

import com.example.dto.GroupRequest;
import com.example.entity.Group;
import com.example.entity.User;
import com.example.repository.GroupRepository;
import com.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public Group createGroup(@RequestBody GroupRequest request) {
        User creator = userRepository.findById(request.getCreatedById())
                .orElseThrow(() -> new RuntimeException("Creator not found"));
        Group group = new Group(request.getName(), creator);
        Set<User> members = new HashSet<>();
        // Add creator as member
        members.add(creator);
        for (Long userId : request.getMemberIds()) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            members.add(user);
        }
        group.setMembers(members);
        return groupRepository.save(group);
    }

    @GetMapping("/{id}")
    public Group getGroup(@PathVariable Long id) {
        return groupRepository.findById(id).orElseThrow(() -> new RuntimeException("Group not found"));
    }

    @GetMapping
    public Iterable<Group> getAllGroups() {
        return groupRepository.findAll();
    }
}
