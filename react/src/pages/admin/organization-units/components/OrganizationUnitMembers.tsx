import {
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { Table, App } from "antd";
import {
  OrganizationUnitServiceProxy,
  OrganizationUnitUserListDto,
} from "@api/generated/service-proxies";
import { useDataTable } from "../../../../hooks/useDataTable";
import { usePermissions } from "../../../../hooks/usePermissions";
import { formatDate } from "../../components/common/timing/lib/datetime-helper";
import type {
  IBasicOrganizationUnitInfo,
  OrganizationUnitMembersRef,
} from "../types";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import AddMemberModal from "./AddMemberModal";
import AppConsts from "@/lib/app-consts";

interface Props {
  organizationUnit?: IBasicOrganizationUnitInfo | null;
  onMemberChanged: () => void;
}

const OrganizationUnitMembers = forwardRef<OrganizationUnitMembersRef, Props>(
  ({ organizationUnit, onMemberChanged }, ref) => {
    const { isGranted } = usePermissions();
    const organizationUnitService = useServiceProxy(
      OrganizationUnitServiceProxy,
      [],
    );
    const [isAddMemberModalVisible, setAddMemberModalVisible] = useState(false);
    const { modal } = App.useApp();

    const fetchFunction = useCallback(
      (skipCount: number, maxResultCount: number, sorting: string) => {
        if (!organizationUnit?.id) {
          return Promise.resolve({ items: [], totalCount: 0 });
        }
        return organizationUnitService.getOrganizationUnitUsers(
          organizationUnit.id,
          sorting,
          skipCount,
          maxResultCount,
        );
      },
      [organizationUnit, organizationUnitService],
    );

    const { records, loading, pagination, handleTableChange, fetchData } =
      useDataTable<OrganizationUnitUserListDto>(fetchFunction);

    useEffect(() => {
      if (organizationUnit?.id) {
        fetchData();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organizationUnit]);

    useImperativeHandle(ref, () => ({
      reload: fetchData,
    }));

    const removeMember = (user: OrganizationUnitUserListDto) => {
      modal.confirm({
        title: L("AreYouSure"),
        content: L("RemoveUserFromOuWarningMessage", {
          0: user.userName,
          1: organizationUnit?.displayName,
        }),
        onOk: async () => {
          await organizationUnitService.removeUserFromOrganizationUnit(
            user.id!,
            organizationUnit!.id!,
          );
          onMemberChanged();
          fetchData();
        },
      });
    };

    const canManageMembers = isGranted(
      "Pages.Administration.OrganizationUnits.ManageMembers",
    );

    const columns = [
      ...(canManageMembers
        ? [
            {
              title: L("Delete"),
              width: "15%",
              render: (_text: string, record: OrganizationUnitUserListDto) => (
                <button
                  className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                  onClick={() => removeMember(record)}
                  title={L("Delete")}
                >
                  <i className="fa fa-times" aria-label={L("Delete")}></i>
                </button>
              ),
            },
          ]
        : []),
      {
        title: L("UserName"),
        dataIndex: "userName",
        sorter: true,
      },
      {
        title: L("AddedTime"),
        dataIndex: "addedTime",
        render: (text: string) =>
          formatDate(text, AppConsts.timing.shortDateFormat),
        sorter: true,
      },
    ];

    if (!organizationUnit) {
      return (
        <div className="text-muted">
          {L("SelectAnOrganizationUnitToSeeMembers")}
        </div>
      );
    }

    return (
      <div className="row">
        <div className="col-12 p-3">
          {canManageMembers && (
            <button
              className="btn btn-outline btn-outline-primary btn-sm float-end mb-3"
              onClick={() => setAddMemberModalVisible(true)}
            >
              <i className="fa fa-plus"></i> {L("AddMember")}
            </button>
          )}
        </div>
        <div className="col-12">
          <Table
            dataSource={records}
            columns={columns}
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
            rowKey="id"
          />
        </div>
        <AddMemberModal
          isVisible={isAddMemberModalVisible}
          onClose={() => setAddMemberModalVisible(false)}
          onSave={() => {
            fetchData();
            onMemberChanged();
          }}
          organizationUnitId={organizationUnit.id}
        />
      </div>
    );
  },
);
export default OrganizationUnitMembers;
