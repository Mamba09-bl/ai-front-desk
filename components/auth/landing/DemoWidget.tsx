"use client";

import { useEffect } from "react";

// Element ids created by public/widget.js.
const WIDGET_ELEMENT_IDS = ["nga-widget-bubble", "nga-widget-frame"];

// How many DemoWidget instances are currently mounted. Lets a script that finishes
// loading after the visitor left the page clean up the bubble it just created.
let activeMounts = 0;

function removeWidget() {
  for (const id of WIDGET_ELEMENT_IDS) document.getElementById(id)?.remove();
}

// Loads the real embeddable widget on this page only. next/script isn't used because it
// runs once per document and would leave the chat bubble on other routes after a client-side navigation.
export default function DemoWidget({ publicKey }: { publicKey: string }) {
  useEffect(() => {
    activeMounts++;

    const script = document.createElement("script");
    script.src = "/widget.js";
    script.async = true;
    script.dataset.key = publicKey;
    script.onload = () => {
      if (activeMounts === 0) removeWidget();
    };
    document.body.appendChild(script);

    return () => {
      activeMounts--;
      script.remove();
      if (activeMounts === 0) removeWidget();
    };
  }, [publicKey]);

  return null;
}
