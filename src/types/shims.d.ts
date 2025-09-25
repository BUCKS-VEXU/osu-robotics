declare module 'connect-pg-simple' {
  import type session from 'express-session';
  function pgSimple(s: typeof session): any;
  export default pgSimple;
}
