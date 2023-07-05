import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FormDTO } from './dto/form.dto';
import { existsSync, readFileSync, unlink, unlinkSync } from 'fs';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
const pdf = require('pdf-parse');
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  getHello(): string {
    return;
  }

  @Get('projects')
  @Render('projects')
  async getProjects() {
    const projects = await this.appService.getProjects();
    return {
      projects: projects,
    };
  }

  @Get('projects/:id')
  @Render('project')
  async getProject(@Param('id') id: string) {
    const project = await this.appService.getProject(id);

    return {
      project: project,
    };
  }

  @Post('/evaluate')
  @Render('evaluate')
  @UseInterceptors(
    FileInterceptor('projectFile', {
      storage: diskStorage({
        destination: './uploads',
      }),
    }),
  )
  async evaluate(
    @Body() formDto: FormDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      let dataBuffer = readFileSync(file.path);
      const data = await pdf(dataBuffer);
      const response = await this.appService.evaluate(data.text);
      // save the data
      formDto.projectContent = data.text;
      formDto.originality =
        response.data[0]['confidences'][0]['confidence'].toFixed(4) * 100;

      formDto.plagiarism = Number((100 - formDto.originality).toFixed(4));
      console.log(
        formDto,
        Number(response.data[0]['confidences'][0]['confidence'].toFixed(4)),
      );

      const project = await this.appService.save(formDto);
      if (existsSync(file.path)) {
        unlinkSync(file.path);
      }
      return { project: project };
    } catch (error) {
      if (existsSync(file.path)) {
        unlinkSync(file.path);
      }
      console.log(error);
      return { error: true };
    }
  }
}
