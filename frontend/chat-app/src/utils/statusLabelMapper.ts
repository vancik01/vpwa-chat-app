import { NotificationsStatus, UserStatus } from 'src/components/models';
const statusLabelsMapper:{
    [key in UserStatus ]:string
} = {
	dnd: 'Do no disturb (DND)',
	offline: 'Offline',
	online:'Online'
}

const notificationsStatusMapper:{
    [key in NotificationsStatus ]:string
} = {
	all: 'All',
	mentions: 'Only mentions'
}
export function getStatusLabel(status: UserStatus){
	return statusLabelsMapper[status]
}

export function getNotificationsStatusLabel(status: NotificationsStatus){
	return notificationsStatusMapper[status]
}