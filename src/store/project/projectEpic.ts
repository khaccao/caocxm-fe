/* eslint-disable import/order */
import dayjs from 'dayjs';
import { catchError, concat, filter, map, mergeMap, of, switchMap, withLatestFrom } from 'rxjs';

import {
  AddMemberToProjectModalName,
  CreateManyProjectMemberLoadingKey,
  EditProjectMemberModalName,
  FormatDateAPI,
  getDinhMucThuongs,
  GettingProjectMembers,
  GettingProjectRolesLoadingKey,
  GettingProjectStatusList,
  ProjectName,
  removeProjectWarehouse,
  SavingProject,
  SavingProjectMemberLoadingKey,
} from '@/common/define';
import { CreateFolderRootProject } from '@/common/project';
import { LabelService } from '@/services/LabelService';
import { CreateProjectMemberPayload, CreateProjectWarehousePayload, ProjectService } from '@/services/ProjectService';
import { FaceCheckService } from '@/services/CheckInService';
import Utils from '@/utils';
import { issueActions } from '../issue';
import { startLoading, stopLoading } from '../loading';
import { hideModal } from '../modal';
import { RootEpic } from '../types';
import { projectActions } from './projectSlice';


const getProjects$: RootEpic = action$ => {
  return action$.pipe(
    filter(projectActions.getProjectsRequest.match),
    switchMap(_action => {
      return concat(
        [startLoading({ key: 'getProjects' })],
        ProjectService.Get.getProjects().pipe(
          switchMap(result => {
            return [projectActions.setProjectsResponse(result)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [projectActions.setProjectsResponse([])];
          }),
        ),
        [stopLoading({ key: 'getProjects' })],
      );
    }),
  );
};

const getProjectById$: RootEpic = action$ => {
  return action$.pipe(
    filter(projectActions.getProjectByIdRequest.match),
    mergeMap(action => {
      const id = action.payload;
      return concat(
        [startLoading({ key: 'getProjectById' })],
        ProjectService.Get.getProjectById(id).pipe(
          switchMap(result => {
            return [projectActions.setProjectByIdResponse(result)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [projectActions.setProjectByIdResponse(null)];
          }),
        ),
        [stopLoading({ key: 'getProjectById' })],
      );
    }),
  );
};

const getProjectsByCompanyId$: RootEpic = action$ => {
  return action$.pipe(
    filter(projectActions.getProjectsByCompanyIdRequest.match),
    switchMap(action => {
      const id = action.payload;
      return concat(
        [startLoading({ key: 'getProjectsByCompanyId' })],
        ProjectService.Get.getProjectsByCompanyId(id).pipe(
          switchMap(result => {
            return [
              projectActions.setProjectList(result),
              // projectActions.getFolderRootIdOutProject({projectId: -1, isGetId: false})
              // projectActions.setProjectsByCompanyIdResponse(result)
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [
              projectActions.setProjectList([]),
              // projectActions.setProjectsByCompanyIdResponse([])
            ];
          }),
        ),
        [stopLoading({ key: 'getProjectsByCompanyId' })],
      );
    }),
  );
};

const getEmployeesByCompanyId$: RootEpic = action$ => {
  return action$.pipe(
    filter(projectActions.getEmployeesByCompanyIdRequest.match),
    switchMap(action => {
      const companyId = action.payload;
      return concat(
        [startLoading({ key: 'getEmployeesByCompanyId' })],
        ProjectService.Get.getEmployeesByCompanyId(companyId, { search: { page: 1, pageSize: 10000 } }).pipe(
          switchMap(response => {
            return [projectActions.setEmployeesByCompanyIdResponse(response.results)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [projectActions.setEmployeesByCompanyIdResponse([])];
          }),
        ),
        [stopLoading({ key: 'getEmployeesByCompanyId' })],
      );
    }),
  );
};

const getRolesByCompanyId$: RootEpic = action$ => {
  return action$.pipe(
    filter(projectActions.getRolesByCompanyIdRequest.match),
    switchMap(action => {
      const companyId = action.payload;
      return concat(
        [startLoading({ key: 'getRolesByCompanyId' })],
        ProjectService.Get.getRolesByCompanyId(companyId).pipe(
          switchMap(response => {
            return [projectActions.setRolesByCompanyIdResponse(response.results)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [projectActions.setRolesByCompanyIdResponse([])];
          }),
        ),
        [stopLoading({ key: 'getRolesByCompanyId' })],
      );
    }),
  );
};
//[20491] [nam_do] them coppy du an khi tao project
const createProject$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.createProjectRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { data, warehouses } = action.payload;
      const ProjectId = state.project.projectById;
      return concat(
        [startLoading({ key: 'createProject' })],
        ProjectService.Post.createProject(data).pipe(
          switchMap(result => {
            // [#20662][dung_lt][05/11/2024] xử lý danh sách warehouse sẽ tạo trong project này
            const projectWarehouses: CreateProjectWarehousePayload[] = warehouses.map((wh) => ({ ...wh, projectId: result.id }))
            const actions: any[] = [
              projectActions.setCreateProjectData(data),
              projectActions.setCreateProjectCurrentStep(3),
              projectActions.setCreateProjectResponse(result),
              projectActions.createFolderRootProject({ projectId: result.id }),
              projectActions.createWarehousesRequest({ projectId: result.id, data: projectWarehouses })
            ];

            if (ProjectId && ProjectId.id) {
              actions.push(projectActions.copyProject({
                oldProjectId: ProjectId.id,
                newProjectId: result.id
              }));
            }

            return actions;
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [
              projectActions.setCreateProjectData(data),
              projectActions.setCreateProjectCurrentStep(0),
              projectActions.setCreateProjectResponse(null),
            ];
          }),
        ),
        [stopLoading({ key: 'createProject' })],
      );
    }),
  );
};

// createFolderRootOutProject trong project
const createFolderRootProject$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.createFolderRootProject.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId } = action.payload;
      const bodyData: CreateFolderRootProject = {
        name: 'root',
        color: '',
        labelCode: '',
        children: [
          {
            idChildren: '',
            type: '',
          },
        ],
        type: 'folder',
      };
      return concat(
        [startLoading({ key: 'createFolderRootProject' })],
        ProjectService.Post.CreateFolderRootProject(projectId, bodyData, {}).pipe(
          switchMap((result: any) => {
            if (result.id) {
              const arrLabels = [
                { ...bodyData, name: "dutruchiphi", labelCode: "DUTRUCHIPHI", type: 'folder', parentId: result.id },
                { ...bodyData, name: "duthau", labelCode: "DUTHAU", type: 'folder', parentId: result.id },
                { ...bodyData, name: "tailieuduan", labelCode: "TAILIEUDUAN", type: 'folder', parentId: result.id },
                { ...bodyData, name: "hopdongthauphu", labelCode: "HOPDONGTHAUPHU", type: 'folder', parentId: result.id },
                { ...bodyData, name: "hosoquyettoan", labelCode: "HSQUYETTOAN", type: 'folder', parentId: result.id },
                { ...bodyData, name: "chiphicongtrinh", labelCode: "CHIPHICONGTRINH", type: 'folder', parentId: result.id },
                { ...bodyData, name: 'thanhtoanthauphu12', labelCode: 'THANHTOANTHAUPHU12', type: 'folder', parentId: result.id },
                { ...bodyData, name: 'thanhtoanthauphu27', labelCode: 'THANHTOANTHAUPHU27', type: 'folder', parentId: result.id }
              ]
              return [projectActions.CreateLabels({ projectId: projectId, bodyData: arrLabels })]
            }
            return [projectActions.getFolderRootId({ projectId: projectId })]
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'createFolderRootProject' })],
      );
    }),
  );
}

// createFolderRootOutProject Ngoài project
const createFolderRootOutProject$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.createFolderRootOutProject.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      // const { projectId } = action.payload;
      const bodyData: CreateFolderRootProject = {
        name: 'root',
        color: '',
        labelCode: '',
        children: [
          {
            idChildren: '',
            type: '',
          },
        ],
        type: 'folder',
      };
      return concat(
        [startLoading({ key: 'createFolderRootOutProject' })],
        ProjectService.Post.CreateFolderRootProject(-1, bodyData, {}).pipe(
          switchMap((result: any) => {
            if (result.id) {
              const projectId = -1;
              const arrLabels = [
                { ...bodyData, name: "luongbophan", labelCode: "LUONGBOPHAN", type: 'folder', parentId: result.id },
                { ...bodyData, name: "ungluong1", labelCode: "UNGLUONG", type: 'folder', parentId: result.id },
                { ...bodyData, name: "ungluong2", labelCode: "UNGLUONG", type: 'folder', parentId: result.id },
                { ...bodyData, name: "thanhtoan1", labelCode: "UNGLUONG", type: 'folder', parentId: result.id },
                { ...bodyData, name: "thanhtoan2", labelCode: "UNGLUONG", type: 'folder', parentId: result.id },
                { ...bodyData, name: "chiphidulichdinhky", labelCode: "CHIPHIDULICHDINHKY", type: 'folder', parentId: result.id },
                { ...bodyData, name: "chiphithuongletet", labelCode: "CHIPHITHUONGLETET", type: 'folder', parentId: result.id },
                { ...bodyData, name: "bangchiquicongdoan", labelCode: "BANGCHIQUYCONGDOAN", type: 'folder', parentId: result.id },
                { ...bodyData, name: "kehoachthanhtoan05", labelCode: "KEHOACHTHANHTOAN05", type: 'folder', parentId: result.id },
                { ...bodyData, name: "kehoachthanhtoan20", labelCode: "KEHOACHTHANHTOAN20", type: 'folder', parentId: result.id },
                { ...bodyData, name: "kehoachtamung12", labelCode: "KEHOACHTAMUNG12", type: 'folder', parentId: result.id },
                { ...bodyData, name: "kehoachtamung27", labelCode: "KEHOACHTAMUNG27", type: 'folder', parentId: result.id }
              ]
              return [projectActions.CreateLabels({ projectId: projectId, bodyData: arrLabels })]
            }
            return [projectActions.getFolderRootIdOutProject({ projectId: -1 })]
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'createFolderRootOutProject' })],
      );
    }),
  );
}
// getFolderRootId trong project
const getFolderRootId$: RootEpic = action$ => {
  return action$.pipe(
    filter(projectActions.getFolderRootId.match),
    switchMap(action => {
      const { projectId, isGetId } = action.payload;
      const bodyData: CreateFolderRootProject = {
        name: '',
        color: '',
        labelCode: '',
        children: [
          {
            idChildren: '',
            type: '',
          },
        ],
        type: '',
        parentId: "",
      };
      return concat(
        [startLoading({ key: 'getFolderRootIds' })],
        ProjectService.Get.getFolderRootId(projectId).pipe(
          switchMap(response => {
            if (isGetId) {
              return [projectActions.getFileRoots({ rootFolderId: response })]
            }
            const arrLabels = [
              { ...bodyData, name: "dutruchiphi", labelCode: "DUTRUCHIPHI", type: 'folder', parentId: response },
              { ...bodyData, name: "duthau", labelCode: "DUTHAU", type: 'folder', parentId: response },
              { ...bodyData, name: "tailieuduan", labelCode: "TAILIEUDUAN", type: 'folder', parentId: response },
              { ...bodyData, name: "hosoquyettoan", labelCode: "HSQUYETTOAN", type: 'folder', parentId: response },
              { ...bodyData, name: "hopdongthauphu", labelCode: "HOPDONGTHAUPHU", type: 'folder', parentId: response },
              { ...bodyData, name: "chiphicongtrinh", labelCode: "CHIPHICONGTRINH", type: 'folder', parentId: response },
              { ...bodyData, name: 'thanhtoanthauphu12', labelCode: 'THANHTOANTHAUPHU12', type: 'folder', parentId: response },
              { ...bodyData, name: 'thanhtoanthauphu27', labelCode: 'THANHTOANTHAUPHU27', type: 'folder', parentId: response },
            ];
            return [projectActions.CreateLabels({ projectId: projectId, bodyData: arrLabels })]
          }),
          catchError(error => {
            if (isGetId) {
              return [];
            }
            Utils.errorHandling(error);
            return []
          }),
        ),
        [stopLoading({ key: 'getFolderRootIds' })],
      );
    }),
  );
};

// getFolderRootId ngoài project 
const getFolderRootIdOutProject$: RootEpic = action$ => {
  return action$.pipe(
    filter(projectActions.getFolderRootIdOutProject.match),
    switchMap(action => {
      const { projectId, isGetId } = action.payload;
      const bodyData: CreateFolderRootProject = {
        name: '',
        color: '',
        labelCode: '',
        children: [
          {
            idChildren: '',
            type: '',
          },
        ],
        type: 'folder',
        parentId: "",
      };
      return concat(
        [startLoading({ key: 'getFolderRootIds' })],
        ProjectService.Get.getFolderRootId(projectId).pipe(
          switchMap(response => {
            if (isGetId) {
              return [projectActions.getFileRootsOutProject({ rootFolderId: response })]
            }
            const arrLabels = [
              { ...bodyData, name: "luongbophan", labelCode: "LUONGBOPHAN", type: 'folder', parentId: response },
              { ...bodyData, name: "ungluong1", labelCode: "UNGLUONG1", type: 'folder', parentId: response },
              { ...bodyData, name: "ungluong2", labelCode: "UNGLUONG2", type: 'folder', parentId: response },
              { ...bodyData, name: "thanhtoan1", labelCode: "THANHTOAN1", type: 'folder', parentId: response },
              { ...bodyData, name: "thanhtoan2", labelCode: "THAHTOAN2", type: 'folder', parentId: response },
              { ...bodyData, name: "thuongcuoinam", labelCode: "THUONGCUOINAM", type: 'folder', parentId: response },
              { ...bodyData, name: "chiphidulichdinhky", labelCode: "CHIPHIDULICHDINHKY", type: 'folder', parentId: response },
              { ...bodyData, name: "chiphithuongletet", labelCode: "CHIPHITHUONGLETET", type: 'folder', parentId: response },
              { ...bodyData, name: "bangchiquicongdoan", labelCode: "BANGCHIQUICONGDOAN", type: 'folder', parentId: response },
              { ...bodyData, name: "kehoachthanhtoan05", labelCode: "KEHOACHTHANHTOAN05", type: 'folder', parentId: response },
              { ...bodyData, name: "kehoachthanhtoan20", labelCode: "KEHOACHTHANHTOAN20", type: 'folder', parentId: response },
              { ...bodyData, name: "kehoachtamung12", labelCode: "KEHOACHTAMUNG12", type: 'folder', parentId: response },
              { ...bodyData, name: "kehoachtamung27", labelCode: "KEHOACHTAMUNG27", type: 'folder', parentId: response }

            ];
            return [projectActions.CreateLabels({ projectId: projectId, bodyData: arrLabels })]
          }),
          catchError(error => {
            if (isGetId) {
              return [];
            }
            Utils.errorHandling(error);
            return []
          }),
        ),
        [stopLoading({ key: 'getFolderRootIds' })],
      );
    }),
  );
};

// tạo 1 label
const CreateLabel$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.CreateLabel.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, bodyData, files, companyId, parentId } = action.payload;
      return concat(
        [startLoading({ key: 'CreateLabel' })],
        ProjectService.Post.CreateLabel(projectId, bodyData, {}).pipe(
          switchMap(result => {
            const labelid = result.id;
            if (files && companyId && labelid) {
              return [issueActions.uploadFileForFolder({ companyId, labelid, files, parentId })];
            }
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'CreateLabel' })],
      );
    }),
  );
};




// tạo nhiều label cùng lúc
const CreateLabels$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.CreateLabels.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, bodyData } = action.payload;
      return concat(
        [startLoading({ key: 'CreateLabels' })],
        LabelService.Post.createLabels(projectId, bodyData, {}).pipe(
          switchMap(result => {
            if (result && result.length > 0) {
              // [11/27/2024]  #20873  Thêm danh sách thầu phụ theo danh sách mẫu
              const Document = result?.find((item: any) => item.labelCode === "HOPDONGTHAUPHU");
              if (Document && Document.id) {
                const arrLabels = [
                  { name: "Khoan cọc nhồi", type: 'folder', parentId: Document.id },
                  { name: "Chống thấm", type: 'folder', parentId: Document.id },
                  { name: "Cừ lasen", type: 'folder', parentId: Document.id },
                  { name: "Đào đất", type: 'folder', parentId: Document.id },
                  { name: "Thí nghiệm", type: 'folder', parentId: Document.id },
                  { name: "Xây, tô, ốp chát", type: 'folder', parentId: Document.id },
                  { name: 'Điều hòa không khí', type: 'folder', parentId: Document.id },
                  { name: 'Phòng cháy chữa cháy', type: 'folder', parentId: Document.id },
                  { name: 'Thang máy', type: 'folder', parentId: Document.id },
                  { name: 'Cơ khí', type: 'folder', parentId: Document.id },
                  { name: 'Cơ điện', type: 'folder', parentId: Document.id },
                  { name: 'Điện nhẹ', type: 'folder', parentId: Document.id },
                  { name: 'Chống mối', type: 'folder', parentId: Document.id },
                  { name: 'Nội thất', type: 'folder', parentId: Document.id },
                  { name: 'Nhôm kính', type: 'folder', parentId: Document.id },
                  { name: 'Đá granite', type: 'folder', parentId: Document.id },
                  { name: 'Cảnh quan', type: 'folder', parentId: Document.id },
                  { name: 'Vệ sinh công nghiệp', type: 'folder', parentId: Document.id },
                  { name: 'Chăn ga gối đệm', type: 'folder', parentId: Document.id },
                  { name: 'Sàn gỗ', type: 'folder', parentId: Document.id }
                ]
                return [projectActions.CreateLabelsExtra({ projectId: projectId, bodyData: arrLabels })]
              }
            }
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'CreateLabels' })],
      );
    }),
  );
};

// tạo 1 label
const CreateLabelsExtra$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.CreateLabelsExtra.match),
    switchMap(({ payload }) => {
      const { projectId, bodyData } = payload;
      return LabelService.Post.createLabels(projectId, bodyData, {}).pipe(
        map(() => stopLoading({ key: 'CreateLabelsExtra' })),
        catchError(error => {
          Utils.errorHandling(error);
          return [];
        }),
      );
    }),
  );
};


const getLabel$: RootEpic = action$ => {
  return action$.pipe(
    filter(projectActions.getLabel.match),
    switchMap(action => {
      const { id, isbiding } = action.payload;
      return concat(
        [startLoading({ key: 'getLabel' })],
        ProjectService.Get.getLabel(id).pipe(
          switchMap(response => {
            if (isbiding) {
              return [projectActions.setLabel(response.documentChildren)];
            }
            return [projectActions.setLabel(response.labelChildren)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [projectActions.setLabel([])];
          }),
        ),
        [stopLoading({ key: 'getLabel' })],
      );
    }),
  );
};

const updateLabel$: RootEpic = action$ => {
  return action$.pipe(
    filter(projectActions.updateLabel.match),
    switchMap(action => {
      const { idLabel, inputData, parentId } = action.payload;
      return concat(
        [startLoading({ key: 'updateLabel' })],
        ProjectService.Put.updateLabel(idLabel, inputData, {}).pipe(
          switchMap(response => {
            Utils.successNotification()
            return [projectActions.getLabel({ id: parentId })]
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'updateLabel' })],
      );
    }),
  );
};

// getFileRoots trong project
const getFileRoots$: RootEpic = action$ => {
  return action$.pipe(
    filter(projectActions.getFileRoots.match),
    switchMap(action => {
      const { rootFolderId, isEdit } = action.payload;
      return concat(
        [startLoading({ key: 'getFileRoot' })],
        ProjectService.Get.getFileRoots(rootFolderId).pipe(
          switchMap(response => {
            if (response && response.results) {
              return [projectActions.setListFileRoots(response)];
            }
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [projectActions.setListFileRoots([])];
          }),
        ),
        [stopLoading({ key: 'getFileRoot' })],
      );
    }),
  );
};

// getFileRoots ngoài project
const getFileRootsOutProject$: RootEpic = action$ => {
  return action$.pipe(
    filter(projectActions.getFileRootsOutProject.match),
    switchMap(action => {
      const { rootFolderId } = action.payload;
      return concat(
        [startLoading({ key: 'getFileRootsOutProject' })],
        ProjectService.Get.getFileRoots(rootFolderId).pipe(
          switchMap(response => {
            if (response && response.results) {
              return [projectActions.setListFileRootsOutproject(response)];
            }
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [projectActions.setListFileRootsOutproject([])];
          }),
        ),
        [stopLoading({ key: 'getFileRootsOutProject' })],
      );
    }),
  );
};


const updateProjectRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.updateProjectRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, data, companyId } = action.payload;
      const search = state.project.queryParams;
      return concat(
        [startLoading({ key: SavingProject })],
        ProjectService.Put.updateProject(projectId, data).pipe(
          switchMap(result => {
            return ProjectService.Get.getProjectsByCompanyId(companyId, { search }).pipe(
              mergeMap(projects => {
                const updatedProject = projects.find((x: any) => x.id === projectId);
                Utils.successNotification();
                return [
                  projectActions.setSelectedProject(updatedProject),
                  projectActions.setProjectList(projects),
                ];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [];
              }),
            );
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: SavingProject })],
      );
    }),
  );
};

const getStatusListRequest$: RootEpic = action$ => {
  return action$.pipe(
    filter(projectActions.getStatusListRequest.match),
    switchMap(action => {
      const { queryParams } = action.payload;
      return concat(
        [startLoading({ key: GettingProjectStatusList })],
        ProjectService.Get.getProjectStatusList({ search: queryParams }).pipe(
          map(statuses => projectActions.setProjectStatuses(statuses)),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [projectActions.setProjectStatuses(undefined)];
          }),
        ),
        [stopLoading({ key: GettingProjectStatusList })],
      );
    }),
  );
};

const getProjectMembersRequest$: RootEpic = action$ => {
  return action$.pipe(
    filter(projectActions.getProjectMembersRequest.match),
    switchMap(action => {
      const { projectId, queryParams } = action.payload;
      return concat(
        [startLoading({ key: GettingProjectMembers })],
        ProjectService.Get.getProjectMembers(projectId, { search: queryParams }).pipe(
          map(members => {
            return projectActions.setProjectMembers(members);
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [projectActions.setProjectMembers(undefined)];
          }),
        ),
        [stopLoading({ key: GettingProjectMembers })],
      );
    }),
  );
};

const getProjectRolesRequest$: RootEpic = action$ => {
  return action$.pipe(
    filter(projectActions.getProjectRolesRequest.match),
    switchMap(action => {
      const { queryParams } = action.payload;
      return concat(
        [startLoading({ key: GettingProjectRolesLoadingKey })],
        ProjectService.Get.getProjectRoles({ search: queryParams }).pipe(
          mergeMap(roles => {
            return [projectActions.setProjectRoles(roles)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [projectActions.setProjectRoles(undefined)];
          }),
        ),
        [stopLoading({ key: GettingProjectRolesLoadingKey })],
      );
    }),
  );
};

export const createManyProjectMembers$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.createManyProjectMemberRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { members, setupCheckIn = true, teamId } = action.payload;
      const { selectedProject, queryParams } = state.project;
      if (!selectedProject) {
        return [];
      }
      return concat(
        [startLoading({ key: CreateManyProjectMemberLoadingKey })],
        ProjectService.Post.createManyProjectMembers(members).pipe(
          switchMap(() => {
            const setupRequest = setupCheckIn && teamId
              ? FaceCheckService.Post.setupProjectCheckInMembers(
                  selectedProject.id,
                  teamId,
                  members.map((member: CreateProjectMemberPayload) => ({
                    employeeId: member.employeeId,
                    employeeCode: member.code,
                    name: member.name,
                    jobTitle: member.roleName || undefined,
                  })),
                ).pipe(
                  catchError(error => {
                    Utils.errorHandling(error);
                    return of([]);
                  }),
                )
              : of([]);
            return setupRequest.pipe(
              switchMap(() =>
                ProjectService.Get.getProjectMembers(selectedProject.id, { search: queryParams }),
              ),
              mergeMap(projMembers => {
                Utils.successNotification();
                return [projectActions.setProjectMembers(projMembers), hideModal({ key: AddMemberToProjectModalName })];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [projectActions.setProjectMembers(undefined)];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: CreateManyProjectMemberLoadingKey })],
      );
    }),
  );
};

export const removeProjectMemberRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.removeProjectMemberRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { employeeId } = action.payload;
      const { selectedProject, queryParams } = state.project;
      if (!selectedProject) {
        return [];
      }
      return concat(
        [startLoading({ key: SavingProject })],
        ProjectService.Delete.removeProjectMember(selectedProject.id, employeeId).pipe(
          switchMap(() => {
            return ProjectService.Get.getProjectMembers(selectedProject.id, { search: queryParams }).pipe(
              mergeMap(projMembers => {
                Utils.successNotification('Removed successfully');
                const employee = projMembers.results[0];
                if (employee) {
                  // [09/11/2024][#20629][phuong_td] Cập nhật endTime khi xóa một nhân công khỏi dự án
                  return [
                    projectActions.updateProjectMemberRequest({ employeeId: employee.employeeId, member: { ...employee, endTime: dayjs().format(FormatDateAPI), ProjectRoleIds: [] } }),
                    projectActions.setProjectMembers(projMembers),
                    hideModal({ key: AddMemberToProjectModalName })
                  ];
                }
                return [
                  projectActions.setProjectMembers(projMembers),
                  hideModal({ key: AddMemberToProjectModalName })
                ];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [projectActions.setProjectMembers(undefined)];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: SavingProject })],
      );
    }),
  );
};

// [#20662][dung_lt][05/11/2024] xóa 1 warehouse ra khỏi project
export const removeProjectWarehouseRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.removeProjectWarehouseRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { warehouse, selectedProject } = action.payload;
      return concat(
        [startLoading({ key: removeProjectWarehouse })],
        ProjectService.Delete.removeProjectWarehouse(warehouse.id).pipe(
          switchMap(() => {
            return ProjectService.Get.getProjectWarehouses(selectedProject.id).pipe(
              mergeMap(repon => {
                console.log(repon);
                return [projectActions.setprojectwarehouse(repon)];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: removeProjectWarehouse })],
      );
    }),
  );
};

export const updateProjectMemberRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.updateProjectMemberRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { employeeId, member } = action.payload;
      const { selectedProject, queryParams } = state.project;
      if (!selectedProject) {
        return [];
      }
      return concat(
        [startLoading({ key: SavingProjectMemberLoadingKey })],
        ProjectService.Put.updateProjectMember(selectedProject.id, employeeId, member).pipe(
          switchMap(() => {
            return ProjectService.Get.getProjectMembers(selectedProject.id, { search: queryParams }).pipe(
              mergeMap(projMembers => {
                Utils.successNotification();
                return [projectActions.setProjectMembers(projMembers), hideModal({ key: EditProjectMemberModalName })];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [projectActions.setProjectMembers(undefined)];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: SavingProjectMemberLoadingKey })],
      );
    }),
  );
};
const createWarehouses$: RootEpic = action$ => {
  return action$.pipe(
    filter(projectActions.createWarehousesRequest.match),
    switchMap(action => {
      const { projectId, data } = action.payload;
      return concat(
        [startLoading({ key: 'createWarehouses' })],
        ProjectService.Post.createWarehouseProject(projectId, data).pipe(
          switchMap((result) => {
            Utils.successNotification();
            return [projectActions.setProjectWarehouseResponse(result)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return of(stopLoading({ key: 'createWarehouses' }));
          }),
        ),
        [stopLoading({ key: 'createWarehouses' })],
      );
    }),
  );
};

// chưa sử dụng.
const createProjectWarehouse$: RootEpic = action$ => {
  return action$.pipe(
    filter(projectActions.createProjectWarehouseRequest.match),
    switchMap(action => {
      const data = action.payload;
      return concat(
        [startLoading({ key: 'createProjectWarehouse' })],
        ProjectService.Post.createProjectWarehouse(data).pipe(
          map(result => projectActions.setProjectWarehouseResponse(result)),
          catchError(error => {
            Utils.errorHandling(error);
            return of(stopLoading({ key: 'createProjectWarehouse' }));
          }),
        ),
        [stopLoading({ key: 'createProjectWarehouse' })],
      );
    }),
  );
};

const projectwarehouse$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.getWarehousesRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId } = action.payload;
      return concat(
        [startLoading({ key: 'getWarehouses' })],
        ProjectService.Get.getProjectWarehouses(projectId).pipe(
          mergeMap(repon => {
            return [projectActions.setprojectwarehouse(repon)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'getWarehouses' })],
      );
    }),
  );
};
//[20491] [nam_do]  coppy du an
const coppyProject$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.copyProject.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { oldProjectId, newProjectId } = action.payload;
      return concat(
        [startLoading({ key: 'copyProject' })],
        ProjectService.Post.copyProject(oldProjectId, newProjectId).pipe(
          mergeMap(repon => {
            return [projectActions.setCoppyproject(repon)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'copyProject' })],
      );
    }),
  );
};
const getpaymentByProject$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.getpaymentByProject.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, paymentTerm, startDate, endDate } = action.payload;
      return concat(
        [startLoading({ key: 'getpaymentByProject' })],
        ProjectService.Get.getpaymentByProject(projectId, paymentTerm, startDate, endDate).pipe(
          mergeMap(response => {
            if (response && response.results) {
              return [projectActions.setPaymentByProject(response.results)];
            } else {
              return [projectActions.setPaymentByProject([])];
            }
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'getpaymentByProject' })],
      );
    }),
  );
};
// [#20693][dung_lt][10/11/2024] lấy thông tin định mức thưởng
const getDinhMucThuongsRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.getDinhMucThuongsRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, teamId, startDate, endDate } = action.payload;
      return concat(
        [startLoading({ key: getDinhMucThuongs })],
        ProjectService.Get.getDinhMucThuongs(projectId, teamId, startDate, endDate).pipe(
          mergeMap(response => {
            return [projectActions.setDinhMucThuongs(response)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: getDinhMucThuongs })],
      );
    }),
  );
};
// [09/11/2024][#20629][phuong_td] Lấy dữ liệu project theo nhân viên
export const getEmployeeProjects$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.getEmployeeProjectsRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { ids, params } = action.payload;
      return concat(
        [startLoading({ key: ProjectName.getEmployeeProjects })],
        ProjectService.Post.getEmployeeProjects(ids, { search: params }).pipe(
          mergeMap(response => {
            if (response) {
              return [projectActions.setEmployeeProjects(response)];
            } else {
              return [projectActions.setEmployeeProjects([])];
            }
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: ProjectName.getEmployeeProjects })],
      );
    }),
  );
};

// [27/11/2024] Implement #20972 Gắn Api xóa dự án
export const removeProject$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.removeProject.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, companyId } = action.payload;
      return concat(
        [startLoading({ key: 'removeProject' })],
        ProjectService.Delete.removeProject(projectId, {}).pipe(
          mergeMap(response => {
            Utils.successNotification('Đã xóa thành công');
            return [projectActions.getProjectsByCompanyIdRequest(companyId)]
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'removeProject' })],
      );
    }),
  );
};

// [22/05/2025][#22653][vy_tt]
const getSubContractorRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(projectActions.getSubContractorRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { subContractorId, options } = action.payload;
      return concat(
        [startLoading({ key: 'getSubContractor' })],
        ProjectService.Get.getSubContractorById(subContractorId, options).pipe(
          mergeMap(response => {
            return [projectActions.setSubContractor(response)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'getSubContractor' })],
      );
    }),
  );
};

export const projectEpics = [
  getProjects$,
  getProjectById$,
  getProjectsByCompanyId$,
  getEmployeesByCompanyId$,
  getDinhMucThuongsRequest$,
  getRolesByCompanyId$,
  createProject$,
  updateProjectRequest$,
  getStatusListRequest$,
  getProjectMembersRequest$,
  getProjectRolesRequest$,
  createManyProjectMembers$,
  removeProjectMemberRequest$,
  updateProjectMemberRequest$,
  createFolderRootProject$,
  createFolderRootOutProject$,
  getFolderRootId$,
  getFolderRootIdOutProject$,
  CreateLabel$,
  CreateLabels$,
  CreateLabelsExtra$,
  getLabel$,
  getFileRoots$,
  getFileRootsOutProject$,
  updateLabel$,
  createWarehouses$,
  createProjectWarehouse$,
  projectwarehouse$,
  coppyProject$,
  getpaymentByProject$,
  removeProjectWarehouseRequest$,
  getEmployeeProjects$,
  removeProject$,
  getSubContractorRequest$,
];



