import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Streak, StreakRecord} from '../../shared/models/streak.model';



@Injectable({
  providedIn: 'root'
})
export class StreakService {
    private streak$: BehaviorSubject<Streak>;
    constructor() {
        this.streak$ = new BehaviorSubject<Streak>({
            id: '',
            title: '',
            description: '',
            records: [],
            createdAt: new Date(),
            updatedAt: new Date()
        });
    };

    getStreak() {
        return this.streak$.asObservable();
    }

    updateStreak(streak: Streak): void {
        this.streak$.next(streak);
    }
}