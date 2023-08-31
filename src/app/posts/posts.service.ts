import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class PostsService {
  constructor(private http: HttpClient, private router: Router) {}
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();
  // getPosts(){
  //   // console.log(this.posts)
  //   // console.log([...this.posts])
  //   // return [...this.posts]
  //   // return this.posts
  // }

  // connect backend
  // getPosts(){
  //   this.http.get('http://localhost:3000/api/posts')
  //   .subscribe(()=>{})
  // }

  // getPosts() {
  //   this.http
  //     .get<{ message: string; posts: Post[] }>(
  //       'http://localhost:3000/api/posts'
  //     )
  //     .subscribe((postData) => {
  //       this.posts = postData.posts;
  //       this.postsUpdated.next([...this.posts]);
  //     });
  // }
  // or
  postData: Post | FormData;
  getPosts(postsPerPage:number, currentPage:number) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`
    this.http
      .get<{ message: string; posts: any }>('http://localhost:3000/api/posts'+queryParams)
      .pipe(
        map((postData) => {
          return postData.posts.map((post:any) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
            };
          });
        })
      ) //without pipe also work
      .subscribe((transformPosts) => {
        this.posts = transformPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdated() {
    return this.postsUpdated.asObservable();
  }
  // getPost(id: string) {
  //   return { ...this.posts.find((p_Id) => p_Id.id === id) };
  // }
  getPost(id: string|null) {
    return this.http.get<{ _id: string; title: string; content: string, imagePath:File }>(
      'http://localhost:3000/api/posts/' + id
    );
  }
  // addPost(title: string, content: string) {
  //   const post: Post = { id: '', title: title, content: content };
  //   this.http
  //     .post<{ message: string }>('http://localhost:3000/api/posts', post)
  //     .subscribe((responseData) => {
  //       console.log(responseData.message)
  //       this.posts.push(post);
  //       this.postsUpdated.next([...this.posts]);
  //     });
  // }
  //or
  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    const post: Post = {
      id: '',
      title: title,
      content: content,
      imagePath: image,
    };
    this.http
      .post<{ message: string; post: Post }>(
        'http://localhost:3000/api/posts',
        postData
      )
      .subscribe((responseData) => {
        const post: Post = {
          id: responseData.post.id,
          title: title,
          content: content,
          imagePath: image,
        };
        const id = responseData.post.id;
        post.id = id;
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      });
  }

  updatePost(id: any, title: string, content: string, imagePath: File) {
    // const post: Post = { id: id, title: title, content: content, imagePath:null };
console.log(id, title, content, imagePath)
    if (typeof imagePath === 'object') {
      const postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', imagePath);
    } else {
      this.postData = {
        id: id,
        title: title,
        content: content,
        imagePath: imagePath,
      };
    }
    this.http
      .put<{ id: string; message: string; postId: string }>(
        'http://localhost:3000/api/posts/' + id,
        this.postData
      )
      .subscribe((response) => {
        console.log(response);
        const updatedPosts = [...this.posts];
        const olderPostIndex = updatedPosts.findIndex((p) => p.id === id);
        const post: Post = {
          id: id,
          title: title,
          content: content,
          imagePath: imagePath,
        };
        updatedPosts[olderPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    this.http
      .delete('http://localhost:3000/api/posts/' + postId)
      .subscribe(() => {
        console.log('Post deleted');
        // after delete remove from frontend
        const updatedPosts = this.posts.filter((post) => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }
}
