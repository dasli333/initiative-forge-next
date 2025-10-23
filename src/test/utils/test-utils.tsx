import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactElement } from "react";

/**
 * Custom render function that wraps components with common providers
 */
function customRender(ui: ReactElement, options?: RenderOptions) {
  return {
    user: userEvent.setup(),
    ...render(ui, { ...options }),
  };
}

export * from "@testing-library/react";
export { customRender as render, userEvent };
