import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare, Heart, Send, Tag, Clock, User } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const CURRENT_USER_ID = "665f1b2c3d4e5f6789012345";
const CURRENT_USERNAME = "alexchen";

interface CommunityPost {
  id: number;
  userId: number;
  username: string;
  content: string;
  tags: string[];
  likes: number;
  commentCount: number;
  createdAt: string;
}

interface PostComment {
  id: number;
  postId: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

export default function CommunityPage() {
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/community-posts"],
  });

  const { data: comments } = useQuery({
    queryKey: ["/api/community-posts", expandedPost, "comments"],
    enabled: !!expandedPost,
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      content: string;
      tags: string[];
    }) => {
      const response = await apiRequest("POST", "/api/community-posts", {
        userId: CURRENT_USER_ID,
        username: CURRENT_USERNAME,
        content: postData.content,
        tags: postData.tags,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts"] });
      setNewPostContent("");
      setSelectedTags([]);
      toast({
        title: "Post Created",
        description: "Your post has been shared with the community!",
      });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest("POST", `/api/community-posts/${postId}/like`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts"] });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async (commentData: {
      postId: number;
      content: string;
    }) => {
      const response = await apiRequest("POST", "/api/post-comments", {
        postId: commentData.postId,
        userId: CURRENT_USER_ID,
        username: CURRENT_USERNAME,
        content: commentData.content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts", expandedPost, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts"] });
      setNewComment("");
      toast({
        title: "Comment Added",
        description: "Your comment has been posted!",
      });
    },
  });

  const availableTags = [
    "Red Team", "White Team", "Phishing", "Malware", "Social Engineering",
    "Penetration Testing", "Incident Response", "Vulnerability Assessment",
    "Network Security", "Web Security", "Mobile Security", "Cloud Security"
  ];

  const handleCreatePost = () => {
    if (newPostContent.trim()) {
      createPostMutation.mutate({
        content: newPostContent,
        tags: selectedTags,
      });
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddComment = (postId: number) => {
    if (newComment.trim()) {
      createCommentMutation.mutate({
        postId,
        content: newComment,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Community Forum 📢</h1>

        {/* New Post Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="Share your thoughts, ask questions, or discuss cybersecurity topics..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            ></textarea>
            <div className="mb-4 flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer ${selectedTags.includes(tag) ? "bg-primary text-primary-foreground" : "text-gray-600 border-gray-300"}`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <Button onClick={handleCreatePost} disabled={!newPostContent.trim()} className="btn-gradient-primary">
              <Send size={16} className="mr-2" /> Post to Community
            </Button>
          </CardContent>
        </Card>

        {/* Posts List */}
        <div className="space-y-6">
          {posts && posts.length > 0 ? (
            posts.map((post: CommunityPost) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback><User size={18} /></AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">{post.username}</p>
                        <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-800 mb-4">{post.content}</p>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <Button variant="ghost" size="sm" onClick={() => likePostMutation.mutate(post.id)}>
                      <Heart size={18} className={`mr-1 ${post.likes > 0 ? "text-red-500 fill-red-500" : ""}`} /> {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}>
                      <MessageSquare size={18} className="mr-1" /> {post.commentCount} Comments
                    </Button>
                  </div>

                  {expandedPost === post.id && (
                    <div className="mt-6 border-t border-gray-200 pt-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Comments</h4>
                      <div className="space-y-4 mb-6">
                        {comments && comments.length > 0 ? (
                          comments.map((comment: PostComment) => (
                            <div key={comment.id} className="flex items-start space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback><User size={16} /></AvatarFallback>
                              </Avatar>
                              <div className="flex-1 bg-gray-100 p-3 rounded-lg">
                                <p className="font-semibold text-sm text-gray-900">{comment.username} <span className="text-xs text-gray-500 font-normal ml-2">{new Date(comment.createdAt).toLocaleDateString()}</span></p>
                                <p className="text-sm text-gray-800">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <textarea
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          rows={1}
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        ></textarea>
                        <Button onClick={() => handleAddComment(post.id)} disabled={!newComment.trim()} className="btn-gradient-primary">
                          <Send size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}