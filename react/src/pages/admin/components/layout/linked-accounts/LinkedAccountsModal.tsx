import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Modal, Table, Pagination, App } from "antd";
import {
  UserLinkServiceProxy,
  type LinkedUserDto,
  type PagedResultDtoOfLinkedUserDto,
  UnlinkUserInput,
} from "../../../../../api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import LinkAccountModal, {
  type LinkAccountModalHandle,
} from "./LinkAccountModal";
import { useLinkedAccount } from "@/hooks/useLinkedAccount";

const DEFAULT_PAGE_SIZE = 10;

export type LinkedAccountsModalHandle = { show: () => void };

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface LinkedAccountsModalProps {}

const LinkedAccountsModal = forwardRef<
  LinkedAccountsModalHandle,
  LinkedAccountsModalProps
>((_props, ref) => {
  const userLinkService = useServiceProxy(UserLinkServiceProxy, []);
  const { switchToLinkedAccount } = useLinkedAccount();
  const { modal } = App.useApp();
  const [visible, setVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<LinkedUserDto[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const linkAccountRef = useRef<LinkAccountModalHandle>(null);

  useImperativeHandle(ref, () => ({
    show: () => setVisible(true),
  }));

  const fetchRecords = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      setLoading(true);
      try {
        const skip = (nextPage - 1) * nextPageSize;
        const res: PagedResultDtoOfLinkedUserDto =
          await userLinkService.getLinkedUsers(
            nextPageSize,
            skip,
            "userName ASC",
          );
        setRecords(res.items || []);
        setTotal(res.totalCount || 0);
      } finally {
        setLoading(false);
      }
    },
    [userLinkService],
  );

  useEffect(() => {
    if (visible) {
      void fetchRecords(1, pageSize);
      setPage(1);
    }
  }, [visible, fetchRecords, pageSize]);

  const onPageChange = (nextPage: number, nextPageSize?: number) => {
    const size = nextPageSize ?? pageSize;
    setPage(nextPage);
    setPageSize(size);
    void fetchRecords(nextPage, size);
  };

  const getShownUserName = (linkedUser: LinkedUserDto): string => {
    const username = linkedUser.username || "";
    if (!abp?.multiTenancy?.isEnabled) return username;
    const tenancy = linkedUser.tenantId ? linkedUser.tenancyName || "." : ".";
    return `${tenancy}\\${username}`;
  };

  const deleteLinkedUser = async (linkedUser: LinkedUserDto) => {
    const input = new UnlinkUserInput();
    input.userId = linkedUser.id;
    input.tenantId = linkedUser.tenantId;
    await userLinkService.unlinkUser(input);
    abp?.notify?.info?.(L("SuccessfullyUnlinked"));
    abp?.event?.trigger?.("linkedAccountsChanged");
    void fetchRecords(page, pageSize);
  };

  const confirmDelete = (linkedUser: LinkedUserDto) => {
    modal.confirm({
      title: L("AreYouSure"),
      content: L("LinkedUserDeleteWarningMessage", [linkedUser.username || ""]),
      okText: L("Yes"),
      cancelText: L("Cancel"),
      onOk: () => deleteLinkedUser(linkedUser),
    });
  };

  const switchToUser = (record: LinkedUserDto) => {
    void switchToLinkedAccount(record);
  };

  return (
    <>
      <Modal
        title={
          <div className="d-flex align-items-center justify-content-between w-100 mb-5">
            <h4 className="modal-title m-0">{L("LinkedAccounts")}</h4>
            <button
              type="button"
              className="btn btn-primary pull-right"
              onClick={() => linkAccountRef.current?.show()}
            >
              <i className="fa fa-plus btn-md-icon" aria-hidden="true"></i>
              <span className="d-none d-md-inline-block ms-2">
                {L("LinkNewAccount")}
              </span>
            </button>
          </div>
        }
        open={visible}
        closable={false}
        onCancel={() => setVisible(false)}
        width={900}
        footer={[
          <button
            key="close"
            type="button"
            className="btn btn-light-primary fw-bold"
            onClick={() => setVisible(false)}
          >
            {L("Close")}
          </button>,
        ]}
        destroyOnHidden
      >
        <Table<LinkedUserDto>
          rowKey={(r) => `${r.id}-${r.tenantId}`}
          dataSource={records}
          loading={loading}
          pagination={false}
          scroll={{ x: true }}
          columns={[
            {
              title: L("Actions"),
              key: "actions",
              width: "20%",
              render: (_: unknown, record: LinkedUserDto) => (
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => void switchToUser(record)}
                >
                  <i className="fa fa-sign-in-alt me-2"></i>
                  {L("LogIn")}
                </button>
              ),
            },
            {
              title: L("UserName"),
              key: "userName",
              width: "65%",
              render: (_: unknown, record: LinkedUserDto) =>
                getShownUserName(record),
            },
            {
              title: L("Delete"),
              key: "delete",
              width: "15%",
              render: (_: unknown, record: LinkedUserDto) => (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm btn-icon"
                  onClick={() => void confirmDelete(record)}
                >
                  <i
                    className="fa fa-trash d-block"
                    aria-label={L("Delete")}
                  ></i>
                </button>
              ),
            },
          ]}
        />

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div />
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            showTotal={(totalCount) =>
              `${L("TotalRecordsCount", [totalCount])}`
            }
            onChange={onPageChange}
          />
        </div>
      </Modal>

      <LinkAccountModal
        ref={linkAccountRef}
        onSaved={() => {
          abp?.event?.trigger?.("linkedAccountsChanged");
          void fetchRecords(1, pageSize);
        }}
      />
    </>
  );
});

export default LinkedAccountsModal;
