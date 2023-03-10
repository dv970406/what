import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PageInfo } from 'src/core/dtos/pagination.dto';
import { Post } from 'src/post/entities/post.entity';

@ObjectType()
export class PostsConnection {
  @Field((type) => [PostEdge])
  edges?: PostEdge[];

  @Field((type) => PageInfo)
  pageInfo?: PageInfo;
}

@ObjectType()
export class PostEdge {
  @Field((type) => Date)
  cursor: Date;

  @Field((type) => Post)
  node: Post;
}
