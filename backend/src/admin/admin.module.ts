import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { ProjectsModule } from '../projects/projects.module';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';
import { Offer } from '../offers/offer.entity';
import { Deal } from '../deals/deal.entity';

@Module({
  imports: [
    ProjectsModule,
    TypeOrmModule.forFeature([Project, User, Offer, Deal]),
  ],
  controllers: [AdminController],
})
export class AdminModule {}
