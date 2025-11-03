export const CRM_FIELDS = [
  'created_at',
  'name',
  'email',
  'country_code',
  'mobile_without_country_code',
  'company',
  'city',
  'state',
  'country',
  'lead_owner',
  'crm_status',
  'crm_note',
  'data_source',
  'possession_time',
  'description',
];

/**
 * Chroma spectrum from the Skeuomorphic-Clean system.
 * Kept as classic ring/bg utilities so they compose with the DataTable cell.
 */
export const STATUS_COLORS = {
  GOOD_LEAD_FOLLOW_UP: 'border-signal-ok/50 bg-signal-ok/10 text-signal-ok',
  DID_NOT_CONNECT: 'border-signal-info/50 bg-signal-info/10 text-signal-info',
  BAD_LEAD: 'border-signal-bad/50 bg-signal-bad/10 text-signal-bad',
  SALE_DONE: 'border-signal-note/50 bg-signal-note/10 text-signal-note',
};

export const FRIENDLY_STATUS = {
  GOOD_LEAD_FOLLOW_UP: 'Good Lead · Follow up',
  DID_NOT_CONNECT: 'Did not connect',
  BAD_LEAD: 'Bad Lead',
  SALE_DONE: 'Sale done',
};
