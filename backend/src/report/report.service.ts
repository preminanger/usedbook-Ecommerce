import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepo: Repository<Report>,
  ) {}

  async createReport(data: {
    reporterId: number;
    reportedUserId: number;
    reason: string;
  }) {
    const report = new Report();
    report.reason = data.reason;
    report.reporter = { id: data.reporterId } as User;
    report.reportedUser = { id: data.reportedUserId } as User;

    return await this.reportRepo.save(report);
  }

  async getAllReports() {
    return await this.reportRepo.find({
      relations: ['reporter', 'reportedUser'],
      order: { createdAt: 'DESC' },
    });
  }
}
