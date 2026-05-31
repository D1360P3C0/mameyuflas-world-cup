/**
 * Barrel export del módulo de predicciones.
 * Solo expone lo que otros módulos pueden necesitar.
 */
export { PredictionsClient }        from './components/PredictionsClient'
export { upsertPredictionAction }   from './actions/predictions.actions'
export { upsertSpecialPredictionsAction } from './actions/predictions.actions'
export {
  upsertBestThirdPredictionsAction,
  upsertGroupStandingPredictionAction,
  upsertKnockoutPredictionAction,
} from './actions/predictions.actions'
export { isPredictionLocked, areSpecialPredictionsLocked } from './utils/prediction.utils'
