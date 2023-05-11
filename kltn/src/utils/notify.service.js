import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export const alertType = {
    success: 'success',
    error: 'error',
    info: 'info',
    warning: 'warning'
}



export class NotifyService {
    static alertSubject = new Subject();
    static confirmSubject = new Subject();
    static defaultId = 'default-alert';

    static onAlert = (alertId) => {
        const id = alertId || NotifyService.defaultId;
        return NotifyService.alertSubject.asObservable().pipe(filter((x) => x && x.id === id));
    }

    static onConfirm = () => {
        return NotifyService.confirmSubject.asObservable();
    }

    // convenience methods
    static success = (message, options) => {
        NotifyService.alert({ ...options, type: alertType.success, message });
    }

    static error = (message, options) => {
        NotifyService.alert({ ...options, type: alertType.error, message });
    }

    static info = (message, options) => {
        NotifyService.alert({ ...options, type: alertType.info, message });
    }

    static warn = (message, options) => {
        NotifyService.alert({ ...options, type: alertType.warning, message });
    }

    // core alert method
    static alert = (alert) => {
        alert.id = alert?.id || NotifyService.defaultId;
        NotifyService.alertSubject.next(alert);
    }

    // clear alerts
    static clear = (id) => {
        id = id || NotifyService.defaultId;
        NotifyService.alertSubject.next({ id });
    }

    static confirm = (config) => {
        NotifyService.confirmSubject.next(config);
    }
}
