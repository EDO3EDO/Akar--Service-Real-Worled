import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthanticationService } from '../services/Authantication.service';
import { map, take } from 'rxjs';

export const clientGuard: CanActivateFn = (route, state) => {


const Auth = inject(AuthanticationService)
const rote = inject(Router)

return Auth.getUserRole().pipe(
  take(1),
  map((role) => {
    if(role === 'client' || role === 'admin'){
      return true;
    }

    rote.navigate([('/client/home')])
    return false ;
  })
)






};
