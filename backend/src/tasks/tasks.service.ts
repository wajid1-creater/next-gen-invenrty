import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private repo: Repository<Task>,
  ) {}

  create(dto: CreateTaskDto, userId: string) {
    const task = this.repo.create({ ...dto, createdById: userId });
    return this.repo.save(task);
  }

  findAll() {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      relations: ['assignedTo', 'createdBy'],
    });
  }

  async findOne(id: string) {
    const task = await this.repo.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy'],
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, data: Partial<CreateTaskDto>) {
    await this.repo.update(id, data as any);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { deleted: true };
  }

  findByUser(userId: string) {
    return this.repo.find({
      where: { assignedToId: userId },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }
}
