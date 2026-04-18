import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Project, ProjectStatus, ProjectCategory } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, ownerId: string): Promise<Project> {
    const project = this.projectsRepository.create({
      ...createProjectDto,
      ownerId,
      status: ProjectStatus.ACTIVE,
    } as Partial<Project>);
    return this.projectsRepository.save(project);
  }

  async findAll(filters?: {
    category?: ProjectCategory;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    status?: ProjectStatus;
    page?: number;
    limit?: number;
  }): Promise<{ projects: Project[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const skip = (page - 1) * limit;

    const queryBuilder = this.projectsRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .where('project.status = :status', { status: filters?.status || ProjectStatus.ACTIVE });

    // Category filter
    if (filters?.category) {
      queryBuilder.andWhere('project.category = :category', { category: filters.category });
    }

    // Price range filter
    if (filters?.minPrice !== undefined) {
      queryBuilder.andWhere('project.price >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters?.maxPrice !== undefined) {
      queryBuilder.andWhere('project.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    // Search filter
    if (filters?.search) {
      queryBuilder.andWhere(
        '(project.title LIKE :search OR project.description LIKE :search OR project.shortDescription LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Order by featured first, then by created date
    queryBuilder.orderBy('project.isFeatured', 'DESC')
      .addOrderBy('project.createdAt', 'DESC');

    const [projects, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { projects, total };
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!project) {
      throw new NotFoundException(`المشروع غير موجود`);
    }

    // Increment view count
    project.viewCount += 1;
    await this.projectsRepository.save(project);

    return project;
  }

  async findByOwner(ownerId: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, ownerId: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id, ownerId },
    });

    if (!project) {
      throw new NotFoundException(`المشروع غير موجود أو ليس لديك صلاحية لتعديله`);
    }

    Object.assign(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const project = await this.projectsRepository.findOne({
      where: { id, ownerId },
    });

    if (!project) {
      throw new NotFoundException(`المشروع غير موجود أو ليس لديك صلاحية لحذفه`);
    }

    await this.projectsRepository.remove(project);
  }

  async incrementOfferCount(id: string): Promise<void> {
    await this.projectsRepository.increment({ id }, 'offerCount', 1);
  }

  async markAsSold(id: string): Promise<Project> {
    const project = await this.findOne(id);
    project.status = ProjectStatus.SOLD;
    project.soldAt = new Date();
    return this.projectsRepository.save(project);
  }
}
