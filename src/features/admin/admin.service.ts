
// import {
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// import { User } from '../../core/entities/user.entity.js';
// import { Post } from '../../core/entities/post.entity.js';
// import { Category } from '../../core/entities/category.entity.js';
// import { Comment } from '../../core/entities/comment.entity.js';
// import { View } from '../../core/entities/view.entity.js';

// import { UserRole } from '../../core/enum/user-role.enum.js';
// import { PostStatus } from '../../core/enum/post-status.enum.js';

// @Injectable()
// export class AdminService {
//   @InjectRepository(User)
//   private readonly userRepository!: Repository<User>;

//   @InjectRepository(Post)
//   private readonly postRepository!: Repository<Post>;

//   @InjectRepository(Category)
//   private readonly categoryRepository!: Repository<Category>;

//   @InjectRepository(Comment)
//   private readonly commentRepository!: Repository<Comment>;

//   @InjectRepository(View)
//   private readonly viewRepository!: Repository<View>;

//   async getDashboard() {
//     const [
//       user,
//       posts,
//       publishedPosts,
//       draftPosts,
//       categories,
//       comments,
//       views,
//     ] = await Promise.all([
//       this.userRepository.count(),
//       this.postRepository.count(),
//       this.postRepository.count({
//         where: { status: PostStatus.PUBLISHED },
//       }),
//       this.postRepository.count({
//         where: { status: PostStatus.DRAFT },
//       }),
//       this.categoryRepository.count(),
//       this.commentRepository.count(),
//       this.viewRepository.count(),
//     ]);

//     return {
//       user,
//       posts: {
//         total: posts,
//         published: publishedPosts,
//         drafts: draftPosts,
//       },
//       categories,
//       comments,
//       views,
//     };
//   }

//   async getComments(): Promise<Comment[]> {
//     return this.commentRepository.find({
//       relations: {
//         post: true,
//         user: true,
//       },
//       order: {
//         createdAt: 'DESC',
//       },
//     });
//   }

//   async deleteComment(id: number): Promise<{ message: string }> {
//     const comment = await this.commentRepository.findOne({
//       where: { id },
//     });

//     if (!comment) {
//       throw new NotFoundException('Comment not found');
//     }

//     await this.commentRepository.remove(comment);

//     return { message: 'Comment deleted successfully' };
//   }

//   async getViews(): Promise<View[]> {
//     return this.viewRepository.find({
//       relations: {
//         post: true,
//       },
//       order: {
//         createdAt: 'DESC',
//       },
//     });
//   }

//   async getViewsStats() {
//     const [totalViews, viewsPerPost] = await Promise.all([
//       this.viewRepository.count(),
//       this.viewRepository
//         .createQueryBuilder('view')
//         .innerJoin('view.post', 'post')
//         .select('post.id', 'postId')
//         .addSelect('post.title', 'postTitle')
//         .addSelect('COUNT(view.id)', 'views')
//         .groupBy('post.id')
//         .addGroupBy('post.title')
//         .orderBy('COUNT(view.id)', 'DESC')
//         .getRawMany(),
//     ]);

//     return {
//       totalViews,
//       viewsPerPost: viewsPerPost.map((item) => ({
//         postId: Number(item.postId),
//         postTitle: item.postTitle,
//         views: Number(item.views),
//       })),
//     };
//   }

//   async getUsersStats() {
//     const [totalUsers, normalUsers, admins] = await Promise.all([
//       this.userRepository.count(),
//       this.userRepository.count({
//         where: { role: UserRole.USER },
//       }),
//       this.userRepository.count({
//         where: { role: UserRole.ADMIN },
//       }),
//     ]);

//     return {
//       totalUsers,
//       normalUsers,
//       admins,
//     };
//   }

//   async getPostsStats() {
//     const [totalPosts, publishedPosts, draftPosts] = await Promise.all([
//       this.postRepository.count(),
//       this.postRepository.count({
//         where: { status: PostStatus.PUBLISHED },
//       }),
//       this.postRepository.count({
//         where: { status: PostStatus.DRAFT },
//       }),
//     ]);

//     return {
//       totalPosts,
//       publishedPosts,
//       draftPosts,
//     };
//   }

//   async getCategoriesStats() {
//     const totalCategories = await this.categoryRepository.count();

//     return { totalCategories };
//   }
// }
