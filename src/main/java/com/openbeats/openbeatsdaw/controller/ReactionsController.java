package com.openbeats.openbeatsdaw.controller;

import com.openbeats.openbeatsdaw.Service.ReactionsService;
import com.openbeats.openbeatsdaw.Utils.TokenProvider;
import com.openbeats.openbeatsdaw.model.Entity.Reactions;
import com.openbeats.openbeatsdaw.model.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/")
public class ReactionsController {

    @Autowired
    private TokenProvider tokenProvider;

    @Autowired
    ReactionsService reactionsService;

    @PostMapping("/like/{postId}")
    @ResponseBody
    public boolean likePost(@PathVariable("postId") Long postId, @RequestHeader(name = "Authorization") String token) {
        Optional<User> currentUser = tokenProvider.getLoggedinUser(token);
        return reactionsService.likePost(currentUser.get().getUserid(), postId);
    }

    @GetMapping("/isLiked/{postId}")
    @ResponseBody
    public boolean isLiked(@PathVariable("postId") Long postId, @RequestHeader(name = "Authorization") String token) {
        Optional<User> currentUser = tokenProvider.getLoggedinUser(token);
        return reactionsService.isLiked(currentUser.get().getUserid(), postId);
    }

    @GetMapping("/reactions/posts/{postId}")
    public Reactions getReactionByPostIdAndUserId(@PathVariable("postId") Long postId,
            @RequestHeader(name = "Authorization") String token) {
        Optional<User> currentUser = tokenProvider.getLoggedinUser(token);
        return reactionsService.getReactionByPostIdAndUserId(postId, currentUser.get().getUserid());
    }

    @PutMapping("/posts/{postId}/likes/{isLike}")
    public Reactions updateReaction(@PathVariable("postId") Long postId,
            @PathVariable("isLike") Boolean isLike,
            @RequestHeader(name = "Authorization") String token) {
        Optional<User> currentUser = tokenProvider.getLoggedinUser(token);
        return reactionsService.updateReaction(postId, currentUser.get().getUserid(), isLike);
    }

    @PostMapping("/reactions/{postId}")
    public Reactions createReaction(@PathVariable("postId") Long postId,
            @RequestHeader(name = "Authorization") String token) {
        Optional<User> currentUser = tokenProvider.getLoggedinUser(token);
        return reactionsService.createReaction(postId, currentUser.get().getUserid());
    }

}
