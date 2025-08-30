import axios from "axios";

export interface CountryData {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  cca3: string;
  ccn3: string;
  region: string;
  subregion?: string;
  flag: string;
}

export interface ISOCountryCode {
  [key: string]: string;
}

export class CountryCodeService {
  private static instance: CountryCodeService;
  private countryCodes: ISOCountryCode | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000;
  private readonly API_URL = "https://restcountries.com/v3.1/all";

  private constructor() {}

  public static getInstance(): CountryCodeService {
    if (!CountryCodeService.instance) {
      CountryCodeService.instance = new CountryCodeService();
    }
    return CountryCodeService.instance;
  }

  /**
   * Fetches country codes from the REST Countries API
   * @returns Promise<ISOCountryCode>
   */
  private async fetchCountryCodes(): Promise<ISOCountryCode> {
    try {
      console.log("Fetching country codes from REST Countries API...");

      const response = await axios.get<CountryData[]>(this.API_URL, {
        timeout: 10000,
      });

      const codes: ISOCountryCode = {};

      response.data.forEach((country) => {
        if (country.cca2 && country.name.common) {
          codes[country.cca2] = country.name.common;
        }
      });

      console.log(
        `Successfully fetched ${Object.keys(codes).length} country codes`
      );
      return codes;
    } catch (error) {
      console.error("Failed to fetch country codes from API:", error);

      // Return fallback data if API fails
      return this.getFallbackCountryCodes();
    }
  }

  /**
   * Gets country codes, fetching from API if needed
   * @returns Promise<ISOCountryCode>
   */
  public async getCountryCodes(): Promise<ISOCountryCode> {
    const now = Date.now();

    if (this.countryCodes && now - this.lastFetch < this.CACHE_DURATION) {
      return this.countryCodes;
    }

    this.countryCodes = await this.fetchCountryCodes();
    this.lastFetch = now;

    return this.countryCodes;
  }

  /**
   * Validates if a country code is valid
   * @param code - The country code to validate
   * @returns Promise<boolean>
   */
  public async isValidCountryCode(code: string): Promise<boolean> {
    const codes = await this.getCountryCodes();
    return code in codes;
  }

  /**
   * Gets the country name for a given code
   * @param code - The country code
   * @returns Promise<string | undefined>
   */
  public async getCountryName(code: string): Promise<string | undefined> {
    const codes = await this.getCountryCodes();
    return codes[code];
  }

  /**
   * Refreshes the cache by forcing a new API call
   * @returns Promise<ISOCountryCode>
   */
  public async refreshCache(): Promise<ISOCountryCode> {
    this.countryCodes = null;
    this.lastFetch = 0;
    return await this.getCountryCodes();
  }

  /**
   * Fallback country codes in case API is unavailable
   * @returns ISOCountryCode
   */
  private getFallbackCountryCodes(): ISOCountryCode {
    console.log("Using fallback country codes");
    return {
      US: "United States",
      CA: "Canada",
      MX: "Mexico",
      GB: "United Kingdom",
      DE: "Germany",
      FR: "France",
      IT: "Italy",
      ES: "Spain",
      NL: "Netherlands",
      BE: "Belgium",
      CH: "Switzerland",
      AT: "Austria",
      SE: "Sweden",
      NO: "Norway",
      DK: "Denmark",
      FI: "Finland",
      PL: "Poland",
      CZ: "Czech Republic",
      HU: "Hungary",
      RO: "Romania",
      BG: "Bulgaria",
      HR: "Croatia",
      SI: "Slovenia",
      SK: "Slovakia",
      LT: "Lithuania",
      LV: "Latvia",
      EE: "Estonia",
      IE: "Ireland",
      PT: "Portugal",
      GR: "Greece",
      CY: "Cyprus",
      MT: "Malta",
      LU: "Luxembourg",
      RU: "Russia",
      UA: "Ukraine",
      BY: "Belarus",
      MD: "Moldova",
      RS: "Serbia",
      ME: "Montenegro",
      BA: "Bosnia and Herzegovina",
      MK: "North Macedonia",
      AL: "Albania",
      IS: "Iceland",
      AD: "Andorra",
      MC: "Monaco",
      SM: "San Marino",
      VA: "Vatican City",
      LI: "Liechtenstein",
      CN: "China",
      JP: "Japan",
      KR: "South Korea",
      IN: "India",
      TH: "Thailand",
      VN: "Vietnam",
      MY: "Malaysia",
      ID: "Indonesia",
      PH: "Philippines",
      PK: "Pakistan",
      BD: "Bangladesh",
      LK: "Sri Lanka",
      NP: "Nepal",
      MM: "Myanmar",
      KH: "Cambodia",
      LA: "Laos",
      MN: "Mongolia",
      KZ: "Kazakhstan",
      UZ: "Uzbekistan",
      KG: "Kyrgyzstan",
      TJ: "Tajikistan",
      TM: "Turkmenistan",
      AF: "Afghanistan",
      IR: "Iran",
      IQ: "Iraq",
      SA: "Saudi Arabia",
      AE: "United Arab Emirates",
      QA: "Qatar",
      KW: "Kuwait",
      BH: "Bahrain",
      OM: "Oman",
      YE: "Yemen",
      JO: "Jordan",
      LB: "Lebanon",
      SY: "Syria",
      IL: "Israel",
      TR: "Turkey",
      GE: "Georgia",
      AM: "Armenia",
      AZ: "Azerbaijan",
      SG: "Singapore",
      HK: "Hong Kong",
      TW: "Taiwan",
      AU: "Australia",
      NZ: "New Zealand",
      BR: "Brazil",
      AR: "Argentina",
      CL: "Chile",
      PE: "Peru",
      CO: "Colombia",
      VE: "Venezuela",
      EC: "Ecuador",
      BO: "Bolivia",
      PY: "Paraguay",
      UY: "Uruguay",
      ZA: "South Africa",
      EG: "Egypt",
      NG: "Nigeria",
      KE: "Kenya",
      ET: "Ethiopia",
      GH: "Ghana",
      UG: "Uganda",
      TZ: "Tanzania",
      DZ: "Algeria",
      MA: "Morocco",
      TN: "Tunisia",
      LY: "Libya",
      SD: "Sudan",
      SS: "South Sudan",
      CM: "Cameroon",
      CI: "Ivory Coast",
      BF: "Burkina Faso",
      ML: "Mali",
      NE: "Niger",
      TD: "Chad",
      CF: "Central African Republic",
      CG: "Republic of the Congo",
      CD: "Democratic Republic of the Congo",
      AO: "Angola",
      ZM: "Zambia",
      ZW: "Zimbabwe",
      BW: "Botswana",
      NA: "Namibia",
      MZ: "Mozambique",
      MW: "Malawi",
      MG: "Madagascar",
      MU: "Mauritius",
      SC: "Seychelles",
      RW: "Rwanda",
      BI: "Burundi",
      DJ: "Djibouti",
      SO: "Somalia",
      ER: "Eritrea",
      SL: "Sierra Leone",
      LR: "Liberia",
      GW: "Guinea-Bissau",
      GN: "Guinea",
      SN: "Senegal",
      GM: "Gambia",
      CV: "Cape Verde",
      MR: "Mauritania",
      TG: "Togo",
      BJ: "Benin",
    };
  }
}
