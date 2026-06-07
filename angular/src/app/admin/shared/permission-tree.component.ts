import { Component, Injector, inject, input, ChangeDetectorRef, NgZone } from '@angular/core';
import { PermissionTreeEditModel } from '@app/admin/shared/permission-tree-edit.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ArrayToTreeConverterService } from '@shared/utils/array-to-tree-converter.service';
import { TreeDataHelperService } from '@shared/utils/tree-data-helper.service';
import { FlatPermissionDto } from '@shared/service-proxies/service-proxies';
import { TreeNode } from 'primeng/api';
import { forEach as _forEach, remove as _remove } from 'lodash-es';
import { FormsModule } from '@angular/forms';
import { TreeModule } from 'primeng/tree';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgClass } from '@node_modules/@angular/common';

@Component({
    selector: 'permission-tree',
    templateUrl: './permission-tree.component.html',
    styleUrls: ['./permission-tree.component.less'],
    imports: [FormsModule, TreeModule, TooltipModule, LocalizePipe, NgClass],
})
export class PermissionTreeComponent extends AppComponentBase {
    private _arrayToTreeConverterService = inject(ArrayToTreeConverterService);
    private _treeDataHelperService = inject(TreeDataHelperService);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _ngZone = inject(NgZone);
    private originalPermissions: FlatPermissionDto[] = [];

    readonly singleSelect = input<boolean>(undefined);
    readonly disableCascade = input<boolean>(undefined);

    treeData: any;
    selectedPermissions: TreeNode[] = [];
    filter = '';
    onlyShowGrantedPermissions = false;
    isTreeExpanded = true;
    fullTreeData: TreeNode[] = [];
    isProcessing = false;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    set editData(val: PermissionTreeEditModel) {
        this.onlyShowGrantedPermissions = false;
        this.setTreeData(val.permissions);

        this._ngZone.runOutsideAngular(() => {
            setTimeout(() => {
                let newTreeData: TreeNode[];

                if (this.onlyShowGrantedPermissions) {
                    const grantedPermissionNames = val.grantedPermissionNames;
                    const grantedPermissions = this.originalPermissions.filter((p) =>
                        grantedPermissionNames.includes(p.name)
                    );
                    newTreeData = this.buildTree(grantedPermissions);
                } else {
                    newTreeData = this.fullTreeData;
                }

                this._ngZone.run(() => {
                    this.treeData = newTreeData;
                    this.setSelectedNodes(val.grantedPermissionNames);
                    this._changeDetectorRef.markForCheck();
                });
            }, 0);
        });
    }

    get onlyShowEnabledPermissionsLabel(): string {
        return this.onlyShowGrantedPermissions ? 'ShowAllPermissions' : 'OnlyShowEnabledPermissions';
    }

    get tooltipText(): string {
        return this.onlyShowGrantedPermissions ? 'ShowAllPermissionsTooltip' : 'OnlyShowEnabledPermissionsTooltip';
    }

    setTreeData(permissions: FlatPermissionDto[]) {
        this.originalPermissions = permissions;
        this.fullTreeData = this.buildTree(permissions);
        this.treeData = this.fullTreeData;
    }

    setSelectedNodes(grantedPermissionNames: string[]) {
        this.selectedPermissions = [];
        _forEach(grantedPermissionNames, (permission) => {
            let item = this._treeDataHelperService.findNode(this.treeData, { data: { name: permission } });
            if (item) {
                this.selectedPermissions.push(item);
            }
        });
    }

    getGrantedPermissionNames(): string[] {
        if (!this.selectedPermissions || !this.selectedPermissions.length) {
            return [];
        }

        let permissionNames = [];

        for (let i = 0; i < this.selectedPermissions.length; i++) {
            permissionNames.push(this.selectedPermissions[i].data.name);
        }

        return permissionNames;
    }

    nodeSelect(event) {
        if (this.singleSelect()) {
            this.selectedPermissions = [event.node];
            return;
        }

        if (this.disableCascade()) {
            return;
        }

        let parentNode = this._treeDataHelperService.findParent(this.treeData, {
            data: { name: event.node.data.name },
        });

        while (parentNode != null) {
            this.selectedPermissions.push(parentNode);
            parentNode = this._treeDataHelperService.findParent(this.treeData, {
                data: { name: parentNode.data.name },
            });
        }
    }

    onNodeUnselect(event) {
        if (this.disableCascade()) {
            return;
        }

        let childrenNodes = this._treeDataHelperService.findChildren(this.treeData, {
            data: { name: event.node.data.name },
        });
        childrenNodes.push(event.node.data.name);
        _remove(this.selectedPermissions, (x) => childrenNodes.indexOf(x.data.name) !== -1);
    }

    filterPermissions(): void {
        if (!this.filter || !this.filter.trim()) {
            if (this.onlyShowGrantedPermissions) {
                const grantedPermissionNames = this.getGrantedPermissionNames();
                const grantedPermissions = this.originalPermissions.filter((p) =>
                    grantedPermissionNames.includes(p.name)
                );
                this.treeData = this.buildTree(grantedPermissions);
            } else {
                this.treeData = this.buildTree(this.originalPermissions);
            }
        } else {
            this.filterPermission(this.treeData, this.filter);
        }
    }

    filterPermission(nodes, filterText): any {
        _forEach(nodes, (node) => {
            const matchesFilter = node.data.displayName.toLowerCase().includes(filterText.toLowerCase());

            if (matchesFilter) {
                node.styleClass = '';
                this.showParentNodes(node);

                if (node.children) {
                    _forEach(node.children, (child) => {
                        child.styleClass = '';
                    });
                }
            } else {
                node.styleClass = 'hidden-tree-node';

                if (node.children) {
                    const childMatches = this.filterPermission(node.children, filterText);

                    if (childMatches) {
                        node.styleClass = '';
                    }
                }
            }
        });

        return nodes.some((n) => !n.styleClass || n.styleClass === '');
    }

    showParentNodes(node): void {
        if (!node.parent) {
            return;
        }

        node.parent.styleClass = '';
        this.showParentNodes(node.parent);
    }

    onOnlyShowGrantedPermissionsChange(value: boolean): void {
        this.isTreeExpanded = true;
        this.isProcessing = true;

        requestAnimationFrame(() => {
            this._ngZone.runOutsideAngular(() => {
                setTimeout(() => {
                    let newTreeData: TreeNode[];

                    if (value) {
                        const grantedPermissionNames = this.getGrantedPermissionNames();
                        const grantedPermissions = this.originalPermissions.filter((p) =>
                            grantedPermissionNames.includes(p.name)
                        );
                        newTreeData = this.buildTree(grantedPermissions);
                    } else {
                        newTreeData = this.buildTree(this.originalPermissions);
                    }

                    if (this.filter && this.filter.trim()) {
                        this.filterPermission(newTreeData, this.filter);
                    }

                    this._ngZone.run(() => {
                        this.treeData = newTreeData;
                        this.isProcessing = false;
                        this._changeDetectorRef.markForCheck();
                    });
                }, 100);
            });
        });
    }

    toggleAllNodes(): void {
        this.isTreeExpanded = !this.isTreeExpanded;
        _forEach(this.treeData, (node) => {
            this.expandRecursive(node, this.isTreeExpanded);
        });
    }

    private expandRecursive(node: TreeNode, isExpand: boolean): void {
        node.expanded = isExpand;
        if (node.children) {
            node.children.forEach((childNode) => {
                this.expandRecursive(childNode, isExpand);
            });
        }
    }

    private buildTree(permissions: FlatPermissionDto[]): TreeNode[] {
        return this._arrayToTreeConverterService.createTree(permissions, 'parentName', 'name', null, 'children', [
            { target: 'key', source: 'name' },
            { target: 'label', source: 'displayName' },
            { target: 'expandedIcon', value: 'fa fa-folder-open text-warning' },
            { target: 'collapsedIcon', value: 'fa fa-folder text-warning' },
            { target: 'expanded', value: true },
        ]);
    }
}
