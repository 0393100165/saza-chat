import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy{
  constructor(public translate: TranslateService) {

    translate.addLangs(['en', 'es', 'it', 'ru', 'de']);
    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|it|es|ru|de/) ? browserLang : 'en');
  }

  title = 'Saza-chat';
  destroy$: Subject<boolean> = new Subject<boolean>();
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
