import { Injectable } from '@angular/core';
import { Exercise } from './exercise.model';
import { Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { UIService } from '../shared/ui.service';

import * as fromTraining from './training.reducer';
import * as UI from '../shared/ui.action';
import * as Training from './training.actions';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {

  // private runningExercise: Exercise;
  // private availableExercises: Exercise[] = [];

  // exerciseChanged = new Subject<Exercise>();
  // exerciseChangedArray = new Subject<Exercise[]>();
  // finishedExercisesChanged = new Subject<Exercise[]>();

  private fbSubs: Subscription[] = [];

  constructor(private fireStore: AngularFirestore,
              private uiService: UIService,
              private store: Store<fromTraining.State>
  ) { }

  fetchAvailableTraining() {
    // this.uiService.loadingStateChanged.next(true);
    this.store.next(new UI.StartLoading());
    this.fbSubs.push(this.fireStore.collection('availableExercises').snapshotChanges().pipe(map(docArray => {
      // throw(new Error());
      return docArray.map(docc => {
        return {
          id: docc.payload.doc.id,
          name: docc.payload.doc.data()['name'],
          duration: docc.payload.doc.data()['duration'],
          calories: docc.payload.doc.data()['calories']
        };
      });
    })).subscribe((exercise: Exercise[]) => {
      // this.availableExercises = exercise;
      // this.exerciseChangedArray.next([...this.availableExercises]);
      this.store.next(new Training.SetAvailableTraining(exercise));

      // this.uiService.loadingStateChanged.next(false);
      this.store.next(new UI.StopLoading());
    }, error => {
      // this.uiService.loadingStateChanged.next(false);
      this.store.next(new UI.StopLoading());
      this.uiService.showSnackbar('Fetching Exercises falied, Please try again later', null, 3000);
    }));
  }

  startExercise(selectedId: string) {
    // this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
    // this.exerciseChanged.next({ ...this.runningExercise });
    this.store.next(new Training.StartTraining(selectedId));
  }

  complateExercise() {
    this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(ex => {
      this.dataToDatabase({ ...ex, date: new Date(), state: 'completed' });
      // this.runningExercise = null;
      // this.exerciseChanged.next(null);
      this.store.next(new Training.StopTraining());
    });
  }

  cancelExercise(progress: number) {
    this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(ex => {
      this.dataToDatabase({
        ...ex,
        duration: ex.duration * (progress / 100),
        calories: ex.calories * (progress / 100),
        date: new Date(),
        state: 'cancelled'
      });
      this.store.next(new Training.StopTraining());
    });
  }

  cancelSubscription() {
    this.fbSubs.forEach(sub => {
      sub.unsubscribe();
    });
  }

  fetchCompletedOrCancelledExercises() {
    // this.uiService.loadingStateChanged.next(true);
    this.store.next(new UI.StartLoading());
    this.fbSubs.push(this.fireStore.collection('finishedExercises').valueChanges().subscribe((exercise: Exercise[]) => {
      // this.finishedExercisesChanged.next(exercise);
      this.store.next(new Training.SetFinishedTraining(exercise));
      // this.uiService.loadingStateChanged.next(false);
      this.store.next(new UI.StopLoading());
    }));
  }

  private dataToDatabase(exercise: Exercise) {
    this.fireStore.collection('finishedExercises').add(exercise);
  }
}
