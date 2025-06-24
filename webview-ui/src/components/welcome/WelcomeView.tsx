import { VSCodeButton, VSCodeLink, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState, memo } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { validateApiConfiguration } from "@/utils/validate"
import { WebServiceClient, StateServiceClient, ModelsServiceClient } from "@/services/grpc-client"
import { StringRequest } from "@shared/proto/common"
import ApiOptions from "@/components/settings/ApiOptions"
import ClineLogoWhite from "@/assets/ClineLogoWhite"
import { UpdateSettingsRequest } from "@shared/proto/state"
import { UpdateApiConfigurationRequest } from "@shared/proto/models"
import { convertApiConfigurationToProto } from "@shared/proto-conversions/models/api-configuration-conversion"
import { convertApiConfigurationToProtoApiConfiguration } from "@shared/proto-conversions/state/settings-conversion"

const WelcomeView = memo(() => {
	const { apiConfiguration, setApiConfiguration } = useExtensionState()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [showApiOptions, setShowApiOptions] = useState(false)
	const [showTokenInput, setShowTokenInput] = useState(false)
	const [zUserToken, setZUserToken] = useState("")

	const disableLetsGoButton = apiErrorMessage != null

	const handleLogin = async () => {
		try {
			await WebServiceClient.openInBrowser(
				StringRequest.create({
					value: "https://mone.test.mi.com/z/info",
				}),
			)
			setShowTokenInput(true)
		} catch (error) {
			console.error("Error opening login page:", error)
		}
	}

	const handleTokenSubmit = async () => {
		if (zUserToken.trim()) {
			const updatedConfig = {
				...apiConfiguration,
				zUserToken: zUserToken.trim(),
			}
			setApiConfiguration(updatedConfig)

			try {
				await StateServiceClient.updateSettings(
					UpdateSettingsRequest.create({
						apiConfiguration: convertApiConfigurationToProtoApiConfiguration(updatedConfig),
					}),
				)
				setShowTokenInput(false)
				setZUserToken("")
			} catch (error) {
				console.error("Failed to update settings with zUserToken:", error)
			}
		}
	}

	const handleSubmit = async () => {
		if (apiConfiguration) {
			try {
				await ModelsServiceClient.updateApiConfigurationProto(
					UpdateApiConfigurationRequest.create({
						apiConfiguration: convertApiConfigurationToProto(apiConfiguration),
					}),
				)
			} catch (error) {
				console.error("Failed to update API configuration:", error)
			}
		}
	}

	useEffect(() => {
		setApiErrorMessage(validateApiConfiguration(apiConfiguration))
	}, [apiConfiguration])

	return (
		<div className="fixed inset-0 p-0 flex flex-col">
			<div className="h-full px-5 overflow-auto">
				<h2>Hi, I'm Cline</h2>
				<div className="flex justify-center my-5">
					<ClineLogoWhite className="size-16" />
				</div>
				<p>
					I can do all kinds of tasks thanks to breakthroughs in{" "}
					<VSCodeLink href="https://www.anthropic.com/news/claude-3-7-sonnet" className="inline">
						Claude 3.7 Sonnet's
					</VSCodeLink>
					agentic coding capabilities and access to tools that let me create & edit files, explore complex projects, use
					a browser, and execute terminal commands <i>(with your permission, of course)</i>. I can even use MCP to
					create new tools and extend my own capabilities.
				</p>

				<p className="text-[var(--vscode-descriptionForeground)]">
					Sign up for an account to get started for free, or use an API key that provides access to models like Claude
					3.7 Sonnet.
				</p>

				<VSCodeButton appearance="primary" onClick={handleLogin} className="w-full mt-1">
					Get Started for Free
				</VSCodeButton>

				{showTokenInput && (
					<div className="mt-4">
						<div className="mb-2">
							<label className="text-sm font-medium text-[var(--vscode-foreground)]">
								请输入从登录页面获取的Token:
							</label>
						</div>
						<VSCodeTextField
							value={zUserToken}
							placeholder="粘贴您的Token到这里"
							onInput={(e) => setZUserToken((e.target as HTMLInputElement).value)}
							className="w-full mb-2"
						/>
						<VSCodeButton onClick={handleTokenSubmit} disabled={!zUserToken.trim()} className="w-full">
							提交Token
						</VSCodeButton>
					</div>
				)}

				{!showApiOptions && (
					<VSCodeButton
						appearance="secondary"
						onClick={() => setShowApiOptions(!showApiOptions)}
						className="mt-2.5 w-full">
						Use your own API key
					</VSCodeButton>
				)}

				<div className="mt-4.5">
					{showApiOptions && (
						<div>
							<ApiOptions showModelOptions={false} />
							<VSCodeButton onClick={handleSubmit} disabled={disableLetsGoButton} className="mt-0.75">
								Let's go!
							</VSCodeButton>
						</div>
					)}
				</div>
			</div>
		</div>
	)
})

export default WelcomeView
