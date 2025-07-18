import { ApiKeyField } from "../common/ApiKeyField"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { DebouncedTextField } from "@components/settings/common/DebouncedTextField.tsx"

/**
 * Props for the MifyProvider component
 */
interface MifyProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
}

/**
 * The Mify provider configuration component
 */
export const MifyProvider = ({ showModelOptions, isPopup }: MifyProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration)

	return (
		<div>
			<ApiKeyField
				initialValue={apiConfiguration?.mifyApiKey || ""}
				onChange={(value) => handleFieldChange("mifyApiKey", value)}
				providerName="Mify"
			/>
			<DebouncedTextField
				initialValue={apiConfiguration?.mifyApiKey || ""}
				style={{ width: "100%", marginTop: "5px" }}
				type="url"
				onChange={(value) => handleFieldChange("mifyApiKey", value)}
				placeholder="Enter Base URL (optional)...">
				<span style={{ fontWeight: 500 }}>Base URL (optional)</span>
			</DebouncedTextField>
			<div style={{ marginTop: "8px", fontSize: "11px", color: "var(--vscode-descriptionForeground)" }}>
				注意:Mify服务使用Mify应用中配置的默认模型，无需配置模型ID.
			</div>
		</div>
	)
}
