export interface IBasicOrganizationUnitInfo {
  id?: number;
  displayName?: string;
  parentId?: number;
}

export interface IUsersWithOrganizationUnit {
  userIds: number[];
  ouId: number;
}

export interface IRolesWithOrganizationUnit {
  roleIds: number[];
  ouId: number;
}

export interface OrganizationUnitTreeRef {
  reload: () => void;
}

export interface OrganizationUnitMembersRef {
  reload: () => void;
}
