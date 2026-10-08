import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthanticationService } from '../services/Authantication.service';

export const adminGuard: CanActivateFn = (route, state) => {

  const authser = inject(AuthanticationService)
  const Route = inject(Router)

  return authser.getUserRole().pipe(
    map((role) => {
      if(role === 'admin'){
        return true;
      }else if(role === 'client'){
      Route.navigate([('/client/home')])
      return false;
      }else if(role === 'worker'){
      Route.navigate([('/login')])
      return false;
      }

      Route.navigate([('/login')])
      return false;

    })
  )
};
