declare module 'react-select-country-list' {
  interface CountryOption {
    value: string
    label: string
  }

  interface CountryList {
    getData(): CountryOption[]
    getLabel(value: string): string | undefined
    getValue(label: string): string | undefined
    setLabel(value: string, label: string): CountryList
    setEmpty(label: string): CountryList
  }

  /**
   * countryList - Utility function
   * @returns void
   */
  const countryList: () => CountryList

  export default countryList
}
