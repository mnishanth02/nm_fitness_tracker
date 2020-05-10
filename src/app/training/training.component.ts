import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TrainingService } from './training.service';
import { Store } from '@ngrx/store';

import * as fromTraining from './training.reducer';
@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})
export class TrainingComponent implements OnInit {

  // exerciseSubscription: Subscription;

  onGoingTraining$: Observable<boolean>;
  constructor(private trainingService: TrainingService, private store: Store<fromTraining.State>) { }

  ngOnInit(): void {
    this.onGoingTraining$ = this.store.select(fromTraining.getIsTraining);

    // this.exerciseSubscription = this.trainingService.exerciseChanged.subscribe(exercise => {
    //   if (exercise) {
    //     this.onGoingTraining = true;
    //   } else {
    //     this.onGoingTraining = false;
    //   }
    // });
  }

  // ngOnDestroy() {
  //   if (this.exerciseSubscription) {
  //     this.exerciseSubscription.unsubscribe();
  //   }
  // }
}
