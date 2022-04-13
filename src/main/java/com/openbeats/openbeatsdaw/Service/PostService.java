package com.openbeats.openbeatsdaw.Service;


import com.openbeats.openbeatsdaw.model.Entity.Post;
import com.openbeats.openbeatsdaw.model.Entity.User;
import com.openbeats.openbeatsdaw.model.UserAndPosts;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.List;
import java.util.Optional;

public interface PostService {
    public Post addPost(Post post, MultipartFile track, MultipartFile picture );

    public boolean removePost(Long postId);
    public Post updatePost(Post post, MultipartFile track, MultipartFile picture );

    public Page<Post> getPosts(Long userid, int pageNo);

    public List<Post> getTrending();

    List<Post> getAnnouncements();

    public List<Post> getNewlyReleased();

    public UserAndPosts search(String searchText);

    public List<Post> allSearchPosts(String searchText);
    
    List<String> getAllGenre();
}
