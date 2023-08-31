import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import {PostsService} from '../posts.service'
import { Post } from '../post.model';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-post-lists',
  templateUrl: './post-lists.component.html',
  styleUrls: ['./post-lists.component.css']
})
export class PostListsComponent implements OnInit, OnDestroy{
  // @Input() posts:any = []
  posts:Post[] = []
  totalPosts = 10;
  postsPerPage = 2;
  pageSizeOptions = [1, 2, 5, 10]
  currentPage = 1
  private postsSub:Subscription | any
  constructor(public PostsService: PostsService) {}

  ngOnInit() {
    this.PostsService.getPosts(this.postsPerPage, this.currentPage)
    this.postsSub = this.PostsService.getPostUpdated().subscribe((posts: Post[])=>{
      this.posts = posts
    })
  }
  onDelete(postId:string){
    this.PostsService.deletePost(postId)
  }
  onChangePage(pageData:PageEvent){
    this.currentPage = pageData.pageIndex + 1
    this.postsPerPage = pageData.pageSize
    this.PostsService.getPosts(this.postsPerPage, this.currentPage)
  }
  ngOnDestroy() {
    this.postsSub.unsubscribe()
  }

}
