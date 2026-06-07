import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Tabs, Modal, App } from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import {
  ResponsiveGridLayout,
  useContainerWidth,
  verticalCompactor,
  type Layout,
  type LayoutItem,
  type ResponsiveLayouts,
} from "react-grid-layout";
import "./customizable-dashboard.css";
import {
  AddNewPageInput,
  AddNewPageOutput,
  AddWidgetInput,
  Dashboard,
  DashboardOutput,
  Page as DtoPage,
  RenamePageInput,
  SavePageInput,
  Widget as DtoWidget,
  DashboardCustomizationServiceProxy,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@api/service-proxy-factory";
import {
  DashboardCustomizationConst,
  UserDashboardViewModel,
  WidgetViewDefinition,
  DashboardContext,
} from "./types";
import { useDashboardConfiguration } from "../hooks/useDashboardConfiguration";
import AddWidgetModal from "../components/add-widget-modal";
import L from "@/lib/L";
import { KTIcon } from "metronic/app/helpers";
import SubHeader from "../../components/common/SubHeader";
import { Dayjs } from "dayjs";
import {
  getDate,
  minusDays,
} from "../../components/common/timing/lib/datetime-helper";

interface Props {
  dashboardName: string;
}

const CustomizableDashboard: React.FC<Props> = ({ dashboardName }) => {
  const { width, containerRef } = useContainerWidth();
  const config = useDashboardConfiguration();
  const dashboardService = useServiceProxy(
    DashboardCustomizationServiceProxy,
    [],
  );
  const { modal } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editModeEnabled, setEditModeEnabled] = useState(false);
  const latestLayoutRef = useRef<Record<string, Layout>>({});
  const [userDashboard, setUserDashboard] = useState<
    UserDashboardViewModel | undefined
  >();
  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [dashboardDefinition, setDashboardDefinition] = useState<
    DashboardOutput | undefined
  >();

  const [addWidgetVisible, setAddWidgetVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<[Dayjs, Dayjs]>(
    () => {
      const end = getDate();
      const start = minusDays(getDate(), 7);
      return [start, end];
    },
  );
  const [addPageDropdownOpen, setAddPageDropdownOpen] = useState(false);
  const [renamePageDropdownOpen, setRenamePageDropdownOpen] = useState(false);
  const [addPageInput, setAddPageInput] = useState("");
  const [renamePageInput, setRenamePageInput] = useState("");

  const getWidgetViewDefinition = useCallback(
    (id: string): WidgetViewDefinition | undefined =>
      config.WidgetViewDefinitions.find((w) => w.id === id),
    [config.WidgetViewDefinitions],
  );

  const generateGuid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const initializeUserDashboardDefinition = useCallback(
    (user: Dashboard, definition: DashboardOutput) => {
      const pages = (user.pages || []).map((p) => {
        const allowed = (p.widgets || []).filter(
          (w) =>
            !!definition.widgets?.find((d) => d.id === w.widgetId) &&
            !!getWidgetViewDefinition(w.widgetId!),
        );
        return {
          id: p.id!,
          name: p.name!,
          widgets: allowed.map((w) => {
            const view = getWidgetViewDefinition(w.widgetId!)!;
            return {
              id: w.widgetId!,
              guid: generateGuid(),
              component: view.component,
              gridInformation: {
                id: w.widgetId!,
                cols: w.width!,
                rows: w.height!,
                x: w.positionX!,
                y: w.positionY!,
              },
            };
          }),
        };
      });

      const filters: Array<{
        id: string;
        name: string;
        component: React.ComponentType;
      }> = [];
      (definition.widgets || []).forEach((w) => {
        if (w.filters && w.filters.length) {
          pages.forEach((page) => {
            if (page.widgets.find((uw) => uw.id === w.id)) {
              w.filters!.forEach((f) => {
                if (!filters.find((x) => x.id === f.id)) {
                  const def = config.widgetFilterDefinitions.find(
                    (d) => d.id === f.id,
                  );
                  if (def)
                    filters.push({
                      id: def.id,
                      name: f.name || def.name || def.id,
                      component: def.component,
                    });
                }
              });
            }
          });
        }
      });

      const vm: UserDashboardViewModel = {
        dashboardName,
        filters,
        pages,
      };
      setUserDashboard(vm);
      setSelectedPageId(pages[0]?.id || "");
    },
    [config.widgetFilterDefinitions, dashboardName, getWidgetViewDefinition],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const appId = DashboardCustomizationConst.Applications.React;
        const [user, def] = await Promise.all([
          dashboardService.getUserDashboard(dashboardName, appId),
          dashboardService.getDashboardDefinition(dashboardName, appId),
        ]);
        if (mounted) {
          initializeUserDashboardDefinition(user, def);
          setDashboardDefinition(def);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [dashboardName, initializeUserDashboardDefinition, dashboardService]);

  const selectedPage = useMemo(
    () => userDashboard?.pages.find((p) => p.id === selectedPageId),
    [userDashboard, selectedPageId],
  );

  const openAddWidgetModal = useCallback(() => setAddWidgetVisible(true), []);

  const removeWidget = useCallback(
    (widgetGuid: string) => {
      const page = userDashboard?.pages.find((p) => p.id === selectedPageId);
      const widget = page?.widgets.find((w) => w.guid === widgetGuid);
      const widgetId = widget?.id;
      const widgetName = dashboardDefinition?.widgets?.find(
        (d) => d.id === widgetId,
      )?.name;
      const pageName = page?.name;
      modal.confirm({
        title: L("AreYouSure"),
        content: L("WidgetDeleteWarningMessage", [
          L(widgetName || widgetId || ""),
          pageName || "",
        ]),
        okType: "danger",
        onOk: () => {
          setUserDashboard((prev) =>
            prev
              ? {
                  ...prev,
                  pages: prev.pages.map((p) =>
                    p.id !== selectedPageId
                      ? p
                      : {
                          ...p,
                          widgets: p.widgets.filter(
                            (w) => w.guid !== widgetGuid,
                          ),
                        },
                  ),
                }
              : prev,
          );
        },
      });
    },
    [dashboardDefinition?.widgets, selectedPageId, userDashboard?.pages, modal],
  );

  const handleAddWidgetClose = useCallback(
    async (widgetId?: string | null) => {
      setAddWidgetVisible(false);
      if (!widgetId || !userDashboard || !selectedPage) return;
      setBusy(true);
      try {
        const view = getWidgetViewDefinition(widgetId);
        if (!view) return;
        const added = await dashboardService.addWidget(
          new AddWidgetInput({
            widgetId,
            pageId: selectedPage.id,
            dashboardName,
            width: view.defaultWidth,
            height: view.defaultHeight,
            application: DashboardCustomizationConst.Applications.React,
          }),
        );
        setUserDashboard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pages: prev.pages.map((p) =>
              p.id !== selectedPage.id
                ? p
                : {
                    ...p,
                    widgets: p.widgets.concat({
                      id: widgetId,
                      guid: generateGuid(),
                      component: view.component,
                      gridInformation: {
                        id: widgetId,
                        cols: added.width!,
                        rows: added.height!,
                        x: added.positionX!,
                        y: added.positionY!,
                      },
                    }),
                  },
            ),
          };
        });
      } finally {
        setBusy(false);
      }
    },
    [
      dashboardName,
      getWidgetViewDefinition,
      selectedPage,
      dashboardService,
      userDashboard,
    ],
  );

  const savePage = useCallback(async () => {
    if (!userDashboard) return;
    setBusy(true);
    try {
      const mergedPages = userDashboard.pages.map((p) => {
        const pageLayout = latestLayoutRef.current[p.id];
        if (!pageLayout || pageLayout.length === 0) return p;
        return {
          ...p,
          widgets: p.widgets.map((w) => {
            const li = pageLayout.find((l: LayoutItem) => l.i === w.guid);
            if (!li) return w;
            return {
              ...w,
              gridInformation: {
                ...w.gridInformation,
                cols: li.w,
                rows: li.h,
                x: li.x,
                y: li.y,
              },
            };
          }),
        };
      });

      const payload = new SavePageInput({
        dashboardName,
        pages: mergedPages.map(
          (p) =>
            new DtoPage({
              id: p.id,
              name: p.name,
              widgets: p.widgets.map(
                (w) =>
                  new DtoWidget({
                    widgetId: w.gridInformation.id,
                    height: w.gridInformation.rows,
                    width: w.gridInformation.cols,
                    positionX: w.gridInformation.x,
                    positionY: w.gridInformation.y,
                  }),
              ),
            }),
        ),
        application: DashboardCustomizationConst.Applications.React,
      });
      await dashboardService.savePage(payload);

      setUserDashboard((prev) =>
        prev ? { ...prev, pages: mergedPages } : prev,
      );
      latestLayoutRef.current = {};
    } finally {
      setBusy(false);
      setEditModeEnabled(false);
    }
  }, [dashboardName, dashboardService, userDashboard]);

  const addNewPage = useCallback(
    async (name: string) => {
      if (!name?.trim()) return;
      setBusy(true);
      try {
        const r: AddNewPageOutput = await dashboardService.addNewPage(
          new AddNewPageInput({
            dashboardName,
            name: name.trim(),
            application: DashboardCustomizationConst.Applications.React,
          }),
        );
        setUserDashboard((prev) =>
          prev
            ? {
                ...prev,
                pages: prev.pages.concat({
                  id: r.pageId!,
                  name: name.trim(),
                  widgets: [],
                }),
              }
            : prev,
        );
        setSelectedPageId(r.pageId!);
      } finally {
        setBusy(false);
      }
    },
    [dashboardName, dashboardService],
  );

  const renamePage = useCallback(
    async (pageId: string, name: string) => {
      if (!name?.trim()) return;
      setBusy(true);
      try {
        await dashboardService.renamePage(
          new RenamePageInput({
            dashboardName,
            id: pageId,
            name: name.trim(),
            application: DashboardCustomizationConst.Applications.React,
          }),
        );
        setUserDashboard((prev) =>
          prev
            ? {
                ...prev,
                pages: prev.pages.map((p) =>
                  p.id === pageId ? { ...p, name: name.trim() } : p,
                ),
              }
            : prev,
        );
      } finally {
        setBusy(false);
      }
    },
    [dashboardName, dashboardService],
  );

  const deletePage = useCallback(
    async (pageId: string) => {
      setBusy(true);
      try {
        const appId = DashboardCustomizationConst.Applications.React;
        const remainingPages = (userDashboard?.pages || []).filter(
          (p) => p.id !== pageId,
        );

        await dashboardService.deletePage(pageId, dashboardName, appId);

        if (remainingPages.length === 0) {
          const [user, def] = await Promise.all([
            dashboardService.getUserDashboard(dashboardName, appId),
            dashboardService.getDashboardDefinition(dashboardName, appId),
          ]);
          setDashboardDefinition(def);
          initializeUserDashboardDefinition(user, def);
          latestLayoutRef.current = {};
        } else {
          setUserDashboard((prev) =>
            prev
              ? { ...prev, pages: prev.pages.filter((p) => p.id !== pageId) }
              : prev,
          );
          if (selectedPageId === pageId)
            setSelectedPageId(remainingPages[0]?.id || "");
        }
      } finally {
        setBusy(false);
      }
    },
    [
      dashboardName,
      selectedPageId,
      dashboardService,
      userDashboard?.pages,
      initializeUserDashboardDefinition,
    ],
  );

  const pages = userDashboard?.pages || [];

  return (
    <>
      <DashboardContext.Provider
        value={{ selectedDateRange, setSelectedDateRange }}
      >
        <div>
          <SubHeader
            title={L("Dashboard")}
            description={L("DashboardHeaderInfo")}
            actions={
              <div className="d-flex align-items-center gap-2">
                {!loading && (userDashboard?.filters?.length || 0) > 0 && (
                  <button
                    type="button"
                    className="btn btn-light-primary btn-filter"
                    onClick={() => setFilterVisible(true)}
                  >
                    <KTIcon iconName="filter" className="fs-5 me-2" />
                    {L("Filter")}
                  </button>
                )}
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={editModeEnabled}
                    onChange={() => setEditModeEnabled((v) => !v)}
                  />
                  <label className="form-check-label ms-2">
                    {L("Edit Mode")}
                  </label>
                </div>
              </div>
            }
          />
          <div className="d-flex align-items-center mb-2"></div>
          <Tabs
            activeKey={selectedPageId}
            onChange={setSelectedPageId}
            tabBarStyle={pages.length <= 1 ? { display: "none" } : undefined}
            items={pages.map((page) => ({
              key: page.id,
              label: pages.length <= 1 ? "" : page.name,
              children: (
                <div ref={containerRef}>
                  <ResponsiveGridLayout
                    width={width}
                    breakpoints={{
                      lg: 1200,
                      md: 992,
                      sm: 768,
                      xs: 480,
                      xxs: 0,
                    }}
                    className={editModeEnabled ? "editing" : ""}
                    cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
                    rowHeight={34}
                    margin={[16, 16]}
                    containerPadding={[0, 0]}
                    compactor={verticalCompactor}
                    autoSize
                    dragConfig={{
                      enabled: editModeEnabled,
                      cancel: ".deleteWidgetButton",
                    }}
                    resizeConfig={{
                      enabled: editModeEnabled,
                    }}
                    layouts={(() => {
                      const generateLayout = (
                        isResponsive: boolean,
                      ): Layout => {
                        return page.widgets.map((w, index) => {
                          const gi = w.gridInformation;
                          const def = getWidgetViewDefinition(w.id);
                          const defaultH = def?.defaultHeight ?? 8;
                          const minH = 3;

                          if (isResponsive) {
                            return {
                              i: w.guid,
                              x: 0,
                              y: index * defaultH,
                              w: 12,
                              h: 12,
                              minW: 12,
                              minH,
                              maxW: 12,
                            } as LayoutItem;
                          } else {
                            const width = Number.isFinite(gi.cols)
                              ? gi.cols
                              : (def?.defaultWidth ?? 8);
                            const h =
                              Number.isFinite(gi.rows) && gi.rows > 0
                                ? gi.rows
                                : defaultH;
                            return {
                              i: w.guid,
                              x: Number.isFinite(gi.x) ? gi.x : 0,
                              y: Number.isFinite(gi.y) ? gi.y : 0,
                              w: width,
                              h,
                              minW: 3,
                              minH,
                              maxW: 12,
                            } as LayoutItem;
                          }
                        });
                      };

                      return {
                        lg: generateLayout(false),
                        md: generateLayout(false),
                        sm: generateLayout(true),
                        xs: generateLayout(true),
                        xxs: generateLayout(true),
                      } as ResponsiveLayouts;
                    })()}
                    onLayoutChange={(currentLayout: Layout) => {
                      latestLayoutRef.current[page.id] = [...currentLayout];
                    }}
                  >
                    {page.widgets.map((w) => (
                      <div key={w.guid} style={{ overflow: "hidden" }}>
                        <div style={{ position: "relative", height: "100%" }}>
                          {editModeEnabled && (
                            <button
                              className="btn btn-sm bg-danger deleteWidgetButton"
                              onClick={() => removeWidget(w.guid)}
                              aria-label="delete widget"
                            >
                              <CloseOutlined
                                style={{ color: "#fff", fontSize: 12 }}
                              />
                            </button>
                          )}
                          <w.component />
                        </div>
                      </div>
                    ))}
                  </ResponsiveGridLayout>
                </div>
              ),
            }))}
          />

          {editModeEnabled && (
            <div
              className="div-dashboard-customization d-flex w-auto shadow-lg align-items-center"
              style={{
                position: "fixed",
                right: 24,
                bottom: 24,
                zIndex: 1050,
                background: "var(--bs-body-bg)",
                padding: 8,
                borderRadius: 8,
              }}
            >
              <div className="me-1 border-end border-right pe-2">
                <button
                  type="button"
                  id="AddWidgetButton"
                  className="btn btn-sm btn-warning btn-elevate-hover btn-pill d-flex align-items-center"
                  onClick={openAddWidgetModal}
                  disabled={loading || !selectedPageId}
                >
                  <PlusOutlined className="me-1" />
                  {L("AddWidget")}
                </button>
              </div>
              <div className="ms-1 me-1 border-end border-right px-2 d-flex align-items-center">
                <div className="position-relative me-2">
                  <button
                    id="dropdownButtonAddPage"
                    type="button"
                    className="btn btn-sm btn-primary dropdown-toggle btn-elevate-hover btn-pill"
                    onClick={() => {
                      setAddPageDropdownOpen((o) => !o);
                      if (!addPageDropdownOpen) setAddPageInput("");
                    }}
                    aria-expanded={addPageDropdownOpen}
                  >
                    <i className="fa fa-plus me-1" />
                    {L("AddPage")}
                  </button>
                  {addPageDropdownOpen && (
                    <ul
                      id="dropdownMenuAddPage"
                      className="dropdown-menu p-4 show"
                      style={{
                        display: "block",
                        position: "absolute",
                        inset: "auto auto 100% 0",
                        transform: "translate3d(0, -8px, 0)",
                        minWidth: 260,
                      }}
                      role="menu"
                      aria-labelledby="dropdownButtonAddPage"
                    >
                      <li role="menuitem">
                        <div className="mb-3">
                          <label className="form-label">
                            {L("NewPageName")}
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={addPageInput}
                            onChange={(e) => setAddPageInput(e.target.value)}
                          />
                        </div>
                        <button
                          className="btn btn-sm w-100 btn-info"
                          onClick={() => {
                            if (addPageInput.trim()) {
                              addNewPage(addPageInput.trim());
                              setAddPageInput("");
                              setAddPageDropdownOpen(false);
                            }
                          }}
                        >
                          {L("Save")}
                        </button>
                      </li>
                    </ul>
                  )}
                </div>

                <div className="position-relative">
                  <button
                    id="dropdownButtonRenamePage"
                    type="button"
                    className="btn btn-sm btn-info btn-elevate-hover btn-pill dropdown-toggle"
                    onClick={() => {
                      if (!selectedPageId) return;
                      setRenamePageDropdownOpen((o) => !o);
                      if (!renamePageDropdownOpen) setRenamePageInput("");
                    }}
                    disabled={!selectedPageId}
                    aria-expanded={renamePageDropdownOpen}
                  >
                    <i className="fa fa-edit me-1" />
                    {L("RenamePage")}
                  </button>
                  {renamePageDropdownOpen && (
                    <ul
                      id="dropdownMenuRenamePage"
                      className="dropdown-menu p-4 show"
                      style={{
                        display: "block",
                        position: "absolute",
                        inset: "auto auto 100% 0",
                        transform: "translate3d(0, -8px, 0)",
                        minWidth: 260,
                      }}
                      role="menu"
                      aria-labelledby="dropdownButtonRenamePage"
                    >
                      <li role="menuitem">
                        <div className="mb-3">
                          <label className="form-label">
                            {L("PageNewName")}
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder={
                              (userDashboard?.pages || []).find(
                                (p) => p.id === selectedPageId,
                              )?.name || ""
                            }
                            value={renamePageInput}
                            onChange={(e) => setRenamePageInput(e.target.value)}
                          />
                        </div>
                        <button
                          className="btn btn-sm w-100 btn-info"
                          onClick={() => {
                            if (renamePageInput.trim() && selectedPageId) {
                              renamePage(
                                selectedPageId,
                                renamePageInput.trim(),
                              );
                              setRenamePageDropdownOpen(false);
                            }
                          }}
                        >
                          {L("Save")}
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
              <div className="ms-1 pe-2 d-flex align-items-center">
                <button
                  id="DeletePageButton"
                  className="btn btn-sm btn-danger btn-elevate-hover btn-pill"
                  onClick={() => selectedPageId && deletePage(selectedPageId)}
                  disabled={!selectedPageId}
                >
                  <i className="fa fa-trash me-1" />
                  {(() => {
                    const count = userDashboard?.pages?.length || 0;
                    if (count > 1) return L("DeletePage");
                    return L("BackToDefaultPage");
                  })()}
                </button>
              </div>
              <div className="ms-1">
                <button
                  type="button"
                  className="btn btn-sm btn-success btn-elevate-hover btn-pill"
                  onClick={savePage}
                  disabled={busy}
                >
                  <i className="fa fa-save me-1" />
                  {L("Save")}
                </button>
              </div>
            </div>
          )}

          <AddWidgetModal
            visible={addWidgetVisible}
            dashboardName={dashboardName}
            pageId={selectedPageId}
            onClose={handleAddWidgetClose}
          />

          <Modal
            title={L("DashboardFilters")}
            open={filterVisible}
            onCancel={() => setFilterVisible(false)}
            footer={[
              <button
                key="close"
                type="button"
                className="btn btn-light-primary fw-bold"
                onClick={() => setFilterVisible(false)}
              >
                {L("Close")}
              </button>,
            ]}
            width={720}
            destroyOnHidden
          >
            <div className="modal-body p-0">
              {(userDashboard?.filters || []).map((f, i) => (
                <div key={f.id}>
                  <div className="row">
                    <h6 className="mb-3">{L(f.name || f.id)}</h6>
                    <div className="col-md-12">
                      <f.component />
                    </div>
                  </div>
                  {i !== (userDashboard?.filters?.length || 0) - 1 && (
                    <hr className="my-4" />
                  )}
                </div>
              ))}
            </div>
          </Modal>
        </div>
      </DashboardContext.Provider>
    </>
  );
};

export default CustomizableDashboard;
