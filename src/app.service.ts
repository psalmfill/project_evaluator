import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { PrismaService } from './prisma.service';
import { FormDTO } from './dto/form.dto';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  getProjects() {
    return this.prismaService.project.findMany();
  }

  getProject(id) {
    return this.prismaService.project.findFirst({
      where: { id },
    });
  }

  save(data: FormDTO) {
    return this.prismaService.project.create({
      data,
    });
  }

  evaluate(data: string) {
    const response = this.httpService
      .post('https://jpwahle-plagiarism-detection.hf.space/run/predict', {
        data: [data],
      })
      .pipe(map((resp) => resp.data));

    //   PaymentDTO
    return lastValueFrom(response);
  }
}
