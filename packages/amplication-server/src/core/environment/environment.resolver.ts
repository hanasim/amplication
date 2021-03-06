import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';
import { UseFilters } from '@nestjs/common';
import { AuthorizeContext } from 'src/decorators/authorizeContext.decorator';
import { AuthorizableResourceParameter } from 'src/enums/AuthorizableResourceParameter';
import { UpdateOneEnvironmentArgs, Environment } from './dto';
import { GqlResolverExceptionsFilter } from 'src/filters/GqlResolverExceptions.filter';
import { EnvironmentService } from './environment.service';

export const GCP_APPS_DOMAIN_VAR = 'GCP_APPS_DOMAIN';

@Resolver(() => Environment)
@UseFilters(GqlResolverExceptionsFilter)
export class EnvironmentResolver {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly configService: ConfigService
  ) {}

  @Mutation(() => Environment, {
    nullable: true,
    description: undefined
  })
  @AuthorizeContext(AuthorizableResourceParameter.EnvironmentId, 'where.id')
  async updateEnvironment(
    @Context() ctx: any,
    @Args() args: UpdateOneEnvironmentArgs
  ): Promise<Environment | null> {
    return this.environmentService.updateEnvironment(args);
  }
}
