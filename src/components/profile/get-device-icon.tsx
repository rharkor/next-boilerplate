import { Icons } from "../icons"

export default function GetDeviceIcon({ name }: { name?: string }) {
  if (!name) {
    return <Icons.desktop />
    // return 'unknown-logo';
  }

  if (
    [
      "Android",
      "CyanogenMod",
      "LineageOS",
      "MIUI",
      "OxygenOS",
      "One UI",
      "Windows Phone",
      "Windows Mobile",
      "ColorOS",
    ].includes(name)
  ) {
    // return 'android-logo';
    return <Icons.mobile />
  }

  if (["iOS", "iPadOS"].includes(name)) {
    // return 'ios-logo';
    return <Icons.mobile />
  }

  if (["Windows"].includes(name)) {
    // return 'windows-logo';
    return <Icons.desktop />
  }

  if (["Arch", "CentOS", "Debian", "Fedora", "Gentoo", "Linux Mint", "openSUSE", "Red Hat", "Ubuntu"].includes(name)) {
    // return 'linux-logo';
    return <Icons.desktop />
  }

  if (["macOS", "OS X"].includes(name)) {
    // return 'macos-logo';
    return <Icons.desktop />
  }

  // return 'unknown-logo';
  return <Icons.desktop />
}
