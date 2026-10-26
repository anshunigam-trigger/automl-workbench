// Hands a file dropped on the Datasets page to the New experiment wizard.
// Lives in module memory, so it survives client-side navigation but not a reload.
let pending = null
export const setPendingUpload = file => { pending = file }
export const takePendingUpload = () => { const f = pending; pending = null; return f }