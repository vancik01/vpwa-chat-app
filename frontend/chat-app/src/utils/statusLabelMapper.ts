import { UserStatus } from 'src/components/models';
const statusLabelsMapper:{
    [key in UserStatus ]:string
} = {
	dnd: 'Do no disturb (DND)',
	offline: 'Offline',
	online:'Online'
}
export function getStatusLabel(status: UserStatus){
	return statusLabelsMapper[status]
}