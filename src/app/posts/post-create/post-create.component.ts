import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Post } from '../post.model';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit {
  // @Output() postCreated = new EventEmitter<Post>();
  errorTitle: any;
  errorContent: any;
  public isLoading = false;
  post: Post;
  private mode = 'create';
   postId: string | null;
  form: FormGroup;
  imagePreview: any;
  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(4)],
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, { validators: [Validators.required] }),
    });
    this.route.paramMap.subscribe((paramMap: ParamMap): void => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap?.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe((postData) => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath:postData.imagePath
          };
          this.form?.setValue({
            title: this.post?.title,
            content: this.post?.content,
            image: this.post?.imagePath
          });
        });
      } else {
        this.mode = 'create';
        this.postId = '';
      }
    });
  }
  onImagePicked(event:any) {
    console.log('E:',event)
    const file = event.target.files[0];
    this.form.patchValue({ image: file });
    this.form.get('image')?.updateValueAndValidity();
    const renderImage = new FileReader();
    renderImage.onload = () => {
      this.imagePreview = renderImage.result;
    };
    renderImage.readAsDataURL(file);
  }

  // post = 'no content';
  // enterValue = '';
  // savePost() {
  //   const post: Post = {
  //     title : this.enterTitle,
  //     content : this.enterContent
  //   }
  //   this.postCreated.emit(post)
  // }
  // or
  // savePost(form: NgForm) {
  //   this.errorTitle = 'Please enter a post title';
  //   this.errorContent = 'Please enter a post content';
  //   if (form.invalid) {
  //     return;
  //   }
  //   const post: Post = {
  //     title: form.value.title,
  //     content: form.value.content,
  //   };
  //   this.postCreated.emit(post);
  // }
  savePost() {
    this.errorTitle = 'Please enter a post title';
    this.errorContent = 'Please enter a post content';
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      return this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    } else {
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }
    this.form.reset();
  }
}
