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

const CURRENT_USER_ID = 1;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community Hub</h1>
            <p className="text-gray-600">Share knowledge and discuss cybersecurity topics</p>
          </div>
        </div>

        {/* Create Post Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Share with the Community</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share your cybersecurity insights, ask questions, or discuss recent news..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={4}
            />
            
            {/* Tags Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tags (optional)</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagToggle(tag)}
                    className="h-7 text-xs"
                  >
                    <Tag size={12} className="mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {newPostContent.length}/500 characters
              </div>
              <Button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() || createPostMutation.isPending}
                className="btn-gradient-primary"
              >
                <Send size={16} className="mr-2" />
                Post
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading community posts...</p>
            </div>
          ) : (posts as CommunityPost[])?.length > 0 ? (
            (posts as CommunityPost[]).map((post) => (
              <Card key={post.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-500 text-white">
                          {post.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{post.username}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-800 leading-relaxed">{post.content}</p>
                  
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Separator />

                  {/* Post Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likePostMutation.mutate(post.id)}
                        className="text-gray-600 hover:text-red-500"
                      >
                        <Heart size={16} className="mr-1" />
                        {post.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        className="text-gray-600 hover:text-blue-500"
                      >
                        <MessageSquare size={16} className="mr-1" />
                        {post.commentCount}
                      </Button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {expandedPost === post.id && (
                    <div className="border-t pt-4 space-y-4">
                      {/* Add Comment */}
                      <div className="flex space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-green-500 text-white text-xs">
                            {CURRENT_USERNAME.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex space-x-2">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(post.id);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddComment(post.id)}
                            disabled={!newComment.trim() || createCommentMutation.isPending}
                          >
                            Post
                          </Button>
                        </div>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-3">
                        {(comments as PostComment[])?.map((comment) => (
                          <div key={comment.id} className="flex space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gray-500 text-white text-xs">
                                {comment.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm">{comment.username}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-800">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600">Be the first to start a conversation!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}