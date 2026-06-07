import { AbpMultiTenancyService } from 'abp-ng2-module';
import { Component, Injector, inject, input, output } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { ChatFriendDto } from './ChatFriendDto';
import { FriendProfilePictureComponent } from '../../../../shared/utils/friend-profile-picture.component';

@Component({
    templateUrl: './chat-friend-list-item.component.html',
    selector: 'chat-friend-list-item',
    imports: [FriendProfilePictureComponent],
})
export class ChatFriendListItemComponent {
    readonly friend = input<ChatFriendDto>(undefined);
    readonly selectChatFriend = output<string>();

    remoteServiceUrl: string = AppConsts.remoteServiceBaseUrl;
    appPath: string = AppConsts.appBaseUrl;
    multiTenancy: AbpMultiTenancyService;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        this.multiTenancy = injector.get(AbpMultiTenancyService);
    }

    getShownUserName(tenanycName: string, userName: string): string {
        if (!this.multiTenancy.isEnabled) {
            return userName;
        }
        return (tenanycName ? tenanycName : '.') + '\\' + userName;
    }

    getRemoteImageUrl(profilePictureId: string, userId: number, tenantId?: number): string {
        return (
            this.remoteServiceUrl +
            '/Profile/GetFriendProfilePictureById?id=' +
            profilePictureId +
            '&userId=' +
            userId +
            '&tenantId=' +
            tenantId
        );
    }
}
