import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AddPropertyComponent } from './components/add-property/add-property.component';
import { PropertiesComponent } from './components/properties/properties.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { authGuard } from './guards/auth.guard';
import { LogoutComponent } from './components/logout/logout.component';
import { PropertyDetailComponent } from './components/property-detail/property-detail.component';
import { AvailableUnitsComponent } from './components/available-units/available-units.component';


export const routes: Routes = [
    {
        path: '',
        redirectTo: 'properties',
        pathMatch: 'full',
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'logout',
        component: LogoutComponent
    },
    {
        path: 'add-property',
        component: AddPropertyComponent,
        canActivate: [authGuard],
    },
    {
        path: 'properties',
        component: PropertiesComponent,
        canActivate: [authGuard],
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
    },
    {
        path: 'reset-password',
        component: ResetPasswordComponent
    },
    {
        path: 'property-detail/:id',
        component: PropertyDetailComponent
    },
    {
        path: 'available-units/:propertyId',
        component: AvailableUnitsComponent 
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
    
export class AppRoutingModule {}