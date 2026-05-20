/**
 * FieldError — inline form-field error message styled with Bootstrap's
 * `invalid-feedback d-block` so it renders without a sibling `.is-invalid`
 * input. Tiny on purpose — used across every form in the app.
 *
 * Intentionally NOT marked "use client": no hooks, no events, no browser
 * APIs. Acting as a "universal" component lets it render server-side when
 * imported into a server page, and slip into a client parent's bundle
 * just as easily.
 */
export default function FieldError({ message, id }) {
  if (!message) return null;
  return (
    <div className="invalid-feedback d-block" id={id} role="alert">
      {message}
    </div>
  );
}
