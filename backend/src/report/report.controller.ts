import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('submit')
  createReport(@Body() body: { reporterId: number; reportedUserId: number; reason: string }) {
    return this.reportService.createReport(body);
  }

  @Get()
  getAllReports() {
    return this.reportService.getAllReports();
  }
}
