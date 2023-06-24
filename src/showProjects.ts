import { Request, Response } from 'express';
import { ProjectMatch } from '@/types/projectMatch';
import Project from '@/models/Project';
import { Types } from 'mongoose';

export default async function showProjects(req: Request, res: Response) {
  try {
    const { _id, title, year, services, status, limit, offset } = req.query;

    // Create an object to store the value of match to use within the pipeline
    const match: ProjectMatch = {
      deleted: false,
    };

    if (_id && typeof _id === 'string') {
      match._id = new Types.ObjectId(_id);
    }

    if (title && typeof title === 'string') {
      // Assign title property if title contains the lette(s) provided
      match.title = new RegExp(title, 'i');
    }

    if (year && typeof year === 'number') {
      match.year = year;
    }

    if (status && typeof status === 'string') {
      match.status = status;
    }

    // Check if services are provided
    if (services) {
      // One provided service has a type of string,
      // two or more provided services has a type of object
      if (typeof services === 'object') {
        // Assign services property if more than one services are provided
        match.services = { $in: services };
      } else {
        // Assign services property if only one service is provided
        match.services = services;
      }
    }

    // Find all projects that matched and is active
    const projects = await Project.aggregate([
      { $match: match },
      {
        $limit: !limit || !Number(limit) ? 15 : parseInt(limit.toString()),
      },
      {
        $skip: !offset || !Number(offset) ? 0 : parseInt(offset.toString()),
      },
    ]).exec();

    // Check if no projects found
    if (projects.length === 0) {
      return res.status(204).json();
    }

    res.status(200).json({
      success: true,
      code: 200,
      data: {
        projects,
        message: 'Successfully retrieved projects',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: 500,
      error: {
        message: 'An unexpected error occurred',
      },
    });
  }
}
