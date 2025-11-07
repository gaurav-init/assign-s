/**
 * Curated sample CSVs bundled with the app for one-click demos. Each shows a
 * different "flavor" of messy real-world input the AI has to normalize.
 */
export const SAMPLES = [
  {
    id: 'facebook',
    name: 'facebook-lead-export.csv',
    label: 'Facebook Lead',
    tone: 'brand',
    rows: 5,
    hint: 'canonical-ish schema',
    csv: `created_time,full_name,email,phone_number,ad_name,city,state,country,notes
2026-06-01T10:12:33+0000,Amit Sharma,amit.sharma@gmail.com,+91 98765 43201,Meridian Tower Launch,Mumbai,Maharashtra,India,Interested — asked about 3BHK
2026-06-01T10:14:11+0000,Neha Gupta,neha.gupta@yahoo.in,+919876543202,Eden Park Weekend,Bangalore,Karnataka,India,Follow up on Monday
2026-06-01T10:18:47+0000,Karan Mehta,,+91-987-654-3203,Sarjapur Plots,Bangalore,Karnataka,India,No email provided; called from wife's phone
2026-06-01T10:22:03+0000,,,+91 9876543204,Leads on demand,Pune,Maharashtra,India,Anonymous — asked for callback
2026-06-01T10:25:39+0000,Divya Rao,divya.rao@outlook.com,,Varah Swamy Retail,Chennai,Tamil Nadu,India,Warm — deal closed the same day
`,
  },
  {
    id: 'gads',
    name: 'google-ads-export.csv',
    label: 'Google Ads',
    tone: 'info',
    rows: 4,
    hint: 'split names, US dates',
    csv: `Lead ID,Date Received,First Name,Last Name,Email Address,Contact Number,Campaign Name,Locality,Region,Status,Remarks
GA-9001,05/25/2026 09:30,Ravi,Kumar,ravi.kumar@example.com,+91 9876543210,Meridian Tower Campaign,Hyderabad,Telangana,Hot Lead,Wants a site visit this weekend
GA-9002,05/25/2026 10:12,Sneha,Iyer,sneha.iyer@example.com,9876543211,Eden Park Ads,Chennai,Tamil Nadu,Not Interested,"Called twice, not interested"
GA-9003,05/25/2026 10:44,Vikram,Bose,,+91-9876543212,Sarjapur Plots Retargeting,Bengaluru,Karnataka,Closed Won,Booking done. Second phone: +91 9012345678
GA-9004,05/25/2026 11:03,Aisha,Kapoor,aisha.kapoor@example.com,,Leads on Demand,Delhi,Delhi,Call Back,Busy — try after 6pm
`,
  },
  {
    id: 'realestate',
    name: 'messy-realestate.csv',
    label: 'Real-estate',
    tone: 'ok',
    rows: 5,
    hint: 'semicolon delim, junk row',
    csv: `Sr No;Enquiry Date;Prospect Name;Contact;Alt Contact;Emails;Project;City;State;Country;Assigned To;Disposition;Additional Notes;Possession;Remarks
1;13-06-2026;"Rohan, Verma";+91 9812345678;9812345600;rohan@example.com; alt.rohan@example.com;Meridian Tower;Mumbai;MH;India;anita@team;Hot;Wants sea-facing 4BHK;Q1 2027;Follow up Friday
2;13-06-2026;Priyanka Reddy;9812345601;;priyanka.reddy@example.com;Eden Park;Bangalore;KA;India;anita@team;Closed;;Ready-to-move;Deal signed
3;13-06-2026;Anonymous Walk-in;;;;;;;;anita@team;Junk;Left no contact info;;Skip
4;13-06-2026;Manoj K;+91 9812345603;;manoj@enterprise.co;Sarjapur Plots;Bangalore;KA;India;varun@team;Follow Up;Interested — send brochure;;Warm
5;13-06-2026;;9812345604;;kiran@example.com;Varah Swamy;Chennai;TN;India;varun@team;Not Reachable;Number busy all day;;Try tomorrow
`,
  },
  {
    id: 'multi',
    name: 'multi-email-multi-phone.csv',
    label: 'Multi-contact',
    tone: 'accent',
    rows: 3,
    hint: 'multiple phones/emails',
    csv: `created,name,emails,phones,company,city,status,note
2026-07-02 09:00,Sameer Ali,"sameer@example.com, sameer.ali@gmail.com","+91 9812340001, +91 9812340002, 9812340003",AliTech,Kolkata,Follow Up,Owner has 3 numbers
2026-07-02 09:15,Neha Kapoor,"neha@example.com, neha.k@gmail.com, neha.kapoor@yahoo.in",+91 9812340004,Kapoor Consulting,Delhi,Hot,Wants pricing sheet by EOD
2026-07-02 09:30,Anonymous,,,Skip Inc,,Dead,Both email and phone missing
`,
  },
];

/**
 * Turn a `SAMPLES` entry into a `File` so it plugs into the existing upload
 * flow with zero branching.
 */
export function sampleToFile(sample) {
  return new File([sample.csv], sample.name, {
    type: 'text/csv',
    lastModified: Date.now(),
  });
}
