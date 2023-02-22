import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { LessThan, Like } from 'typeorm';
import { CreatePostInput, CreatePostOutput } from './dtos/post/create-post.dto';
import { DeletePostInput, DeletePostOutput } from './dtos/post/delete-post.dto';
import { GetPostInput, GetPostOutput } from './dtos/post/get-post.dto';
import { GetPostsInput, GetPostsOutput } from './dtos/post/get-posts.dto';
import { UpdatePostInput, UpdatePostOutput } from './dtos/post/update-post.dto';
import { Post } from './entities/post.entity';
import { PostRepository } from './repositories/post.repository';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostRepository)
    private readonly postRepo: PostRepository,
  ) {}

  async isMyPost(loggedInUser: User, post: Post): Promise<boolean> {
    return loggedInUser.id === post.user.id;
  }
  async getPosts({
    keyword,
    first,
    after,
  }: GetPostsInput): Promise<GetPostsOutput> {
    try {
      const [findMyPosts, totalCount] = await this.postRepo.findAndCount({
        order: { createdAt: 'DESC' },
        where: {
          ...(after && { createdAt: LessThan(after) }),
        },
        ...(keyword && {
          where: [
            {
              title: Like(`%${keyword}%`),
              ...(after && { createdAt: LessThan(after) }),
            },
            {
              content: Like(`%${keyword}%`),
              ...(after && { createdAt: LessThan(after) }),
            },
          ],
        }),
        relations: {
          user: true,
        },
        take: first,
      });

      const edges = findMyPosts.map((user) => ({
        cursor: user.createdAt,
        node: user,
      }));
      const endCursor = totalCount > 0 ? edges[edges.length - 1].cursor : null;

      return {
        ok: true,
        edges,
        pageInfo: {
          endCursor,
          hasNextPage: totalCount > first,
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '게시글 목록 조회에 실패했습니다.',
      };
    }
  }

  async getPost({ id: postId }: GetPostInput): Promise<GetPostOutput> {
    try {
      const findPost = await this.postRepo.findPost({ postId });

      return {
        ok: true,
        post: findPost,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '게시글 조회에 실패했습니다.',
      };
    }
  }

  async createPost(
    loggedInUser: User,
    { title, content }: CreatePostInput,
  ): Promise<CreatePostOutput> {
    try {
      if (!title) {
        throw new Error('제목을 입력해주세요.');
      }

      const newPost = await this.postRepo.save({
        title,
        content,
        user: loggedInUser,
      });

      const edge = {
        node: newPost,
        cursor: newPost.createdAt,
      };
      return {
        ok: true,
        edge,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '게시글 생성에 실패했습니다.',
      };
    }
  }

  async updatePost(
    loggedInUser: User,
    { postId, title, content }: UpdatePostInput,
  ): Promise<UpdatePostOutput> {
    try {
      if (!title) {
        throw new Error('제목을 입력해주세요.');
      }

      const findPost = await this.postRepo.findPost({ postId });

      if (loggedInUser.id !== findPost.userId) {
        throw new Error('게시글의 소유자가 아닙니다.');
      }

      await this.postRepo.save([{ id: postId, title, content }]);

      const updatedPost = await this.postRepo.findPost({ postId });

      return {
        ok: true,
        post: updatedPost,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '직책 수정에 실패했습니다.',
      };
    }
  }
  async deletePost(
    loggedInUser: User,
    { id: postId }: DeletePostInput,
  ): Promise<DeletePostOutput> {
    try {
      const findPost = await this.postRepo.findPost({ postId });

      if (loggedInUser.id !== findPost.userId) {
        throw new Error('게시글의 소유자가 아닙니다.');
      }

      await this.postRepo.delete({ id: postId });
      return {
        ok: true,
        deletedPostId: postId,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '직책 삭제에 실패했습니다.',
      };
    }
  }
}
