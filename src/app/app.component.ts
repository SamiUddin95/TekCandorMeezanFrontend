import {Component, inject, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import * as tablerIcons from '@ng-icons/tabler-icons';
import * as tablerIconsFill from '@ng-icons/tabler-icons/fill';
import {provideIcons} from '@ng-icons/core';
import {Title} from '@angular/platform-browser';
import {filter, map, mergeMap} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {AuthService} from './services/auth.service';
import {InactivityService} from './services/inactivity.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    viewProviders: [provideIcons({...tablerIcons, ...tablerIconsFill})]
})
export class AppComponent implements OnInit, OnDestroy {
    private titleService = inject(Title)
    private router = inject(Router)
    private activatedRoute = inject(ActivatedRoute)
    private authService = inject(AuthService)
    private inactivityService = inject(InactivityService)

    private authSub: Subscription | null = null;

    ngOnInit(): void {
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                map(() => {
                    let route = this.activatedRoute;
                    while (route.firstChild) {
                        route = route.firstChild;
                    }
                    return route;
                }),
                mergeMap(route => route.data)
            )
            .subscribe(data => {
                if (data['title']) {
                    this.titleService.setTitle(data['title'] +
                        ' | TEK - CANDOR');
                }
            });

        // Start / stop inactivity tracking based on auth state
        this.authSub = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
            if (isLoggedIn) {
                this.inactivityService.start();
            } else {
                this.inactivityService.stop();
            }
        });
    }

    ngOnDestroy(): void {
        this.authSub?.unsubscribe();
        this.inactivityService.stop();
    }
}
