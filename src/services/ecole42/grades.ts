import { LocalAccount } from "@/stores/account/types";
import {
  type AverageOverview,
  type Grade,
} from "@/services/shared/Grade";
import uuid from "@/utils/uuid-v4";
import axios from "axios";
import { log } from "@/utils/logger/logger"; // delete

export const saveEcole42Grades = async (token: string): Promise<{
  grades: Grade[];
  averages: AverageOverview;
}> => {
  try {
    const userData = await axios.get("https://api.intra.42.fr/v2/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const projectsUsers = userData.data.projects_users;

    const gradesList: Grade[] = [];
    const averages: AverageOverview = {
      classOverall: {
        value: null,
        disabled: true,
      },
      overall: {
        value: null,
        disabled: true,
      },
      subjects: [],
    };

    projectsUsers.forEach((project: any) => {
      const projectName = project.project.name;

      const grade: Grade = {
        student: {
          value: project.final_mark !== null ? project.final_mark : null,
          disabled: project.final_mark === null,
        },
        min: {
          value: null,
          disabled: true,
        },
        max: {
          value: null,
          disabled: true,
        },
        average: {
          value: null,
          disabled: true,
        },
        id: uuid(),
        outOf: {
          value: 100,
          disabled: false,
        },
        description: projectName,
        timestamp: new Date(project.marked_at).getTime(),
        coefficient: 1,
        isBonus: false,
        isOptional: false,
        subjectName: projectName,
      };
      if (project.status === "finished") {
        gradesList.push(grade);
      }
    });

    log("Fetched data:" + JSON.stringify(projectsUsers, null, 2), "ecole42"); // delete
    return { grades: gradesList, averages: averages };
  } catch (e) {
    console.error(e);
    return {
      grades: [],
      averages: {
        classOverall: {
          value: null,
          disabled: true,
        },
        overall: {
          value: null,
          disabled: true,
        },
        subjects: [],
      },
    };
  }
};
